import os
import re
import traceback
from csv import DictWriter
from hashlib import sha256
import json
from datetime import datetime

import requests
from bs4 import BeautifulSoup


def main():
    input_json = r'./static/line-dance-db.json'
    with open(input_json) as f:
        db = json.load(f)
    json_backup = insert_timestamp(input_json)
    with open(json_backup, 'w') as f:
        json.dump(db, f, indent=2)
    with open('copperknob_links.txt', 'r') as f:
        url_list = [line.strip() for line in f]
    dances = []
    failed_to_parse = []
    for url in url_list:
        try:
            dance_key = '-'.join(parse_copperknob_url(url))
        except:
            print(traceback.format_exc())
            print(f'Skipping {url}...')
            failed_to_parse.append(url)
            continue
        if dance_key not in db['line_dances']:
            try:
                page = requests.get(url)
                page_soup = BeautifulSoup(page.text, 'html.parser')
                dance_info = parse_sheet_info(page_soup)

                dance = {
                    'Dance': dance_info['Dance'],
                    'Choreographer': ', '.join(dance_info['Choreographer']),
                    'Music': ', '.join(dance_info['Music']),
                    'Level': dance_info['Level'],
                }
                
                dance['Year Learned'] = ""
                dance['Month Learned'] = ""
                dance['Memory'] = 1
                dance.update({
                    'Stepsheet Link': url,
                })
                
                dance_dict = {
                    dance_key: dance
                }
                print(dance_dict)
                dances.append(dance_dict)

                db['line_dances'].update(dance_dict)
            except:
                print(traceback.format_exc())
                print(f'Skipping {url}...')
                failed_to_parse.append(url)
        else:
            print(f'{url} already in database, skipping...')

    with open(input_json, 'w') as f:
        json.dump(db, f, indent=2)

    with open('failed_to_parse.txt', 'w', newline='') as f:
        f.write('\n'.join(failed_to_parse))

def parse_copperknob_url(url):
    try:
        dance_id, dance_name = re.findall(r'stepsheets/(\d+)/([\w-]+)', url)[0]
    except:
        dance_name, dance_id = re.findall(r'stepsheets/([\w-]+)-ID(\d+)', url)[0]
    return dance_name, dance_id


def parse_sheet_info(soup):
    dance_name = soup.find('h2').text
    sheet_info = soup.find(class_='sheetinfo')
    count = sheet_info.find(class_='sheetinfocount').find('span').text
    walls = sheet_info.find(class_='sheetinfowall').find('span').text
    level = sheet_info.find(class_='sheetinfolevel').find('span').text
    choregraphers = parse_choreographer(sheet_info)
    music = parse_music(sheet_info)
    return {
        'Dance': dance_name,
        'Choreographer': choregraphers,
        'Music': music,
        'Counts': count,
        'Walls': walls,
        'Level': level,
    }


def parse_choreographer(soup):
    choreo_line = soup.find(class_='sheetinfochoregrapher')
    choreographer_tags = choreo_line.find('span').findAll(class_='defaultlink')
    choreographer_names = [i.text for i in choreographer_tags]
    return choreographer_names


def parse_music(soup):
    """ Assumes first span is the song name/info """
    music_line = soup.find(class_='sheetinfomusic')
    music_tags = music_line.find('span').findAll(class_='defaultlink')
    if not music_tags:
        music_name = [music_line.find('span').text]
    else:
        music_name = [i.text + i.next_sibling.text for i in music_tags]
    return music_name

def insert_timestamp(filename):
    base, ext = os.path.splitext(filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{base}_{timestamp}{ext}"


if __name__ == '__main__':
    main()