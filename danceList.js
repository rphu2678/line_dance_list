
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();


function getData() {

    let dances = db.ref('line_dances');
    dances.on('value', (snapshot) => {
        
        let dataSet = [];
        let danceList = snapshot.val();
        if (danceList) {
            for (let danceId in danceList) {
                danceObj = danceList[danceId];
                let dataRow = [];
                dance = document.createElement('a');
                dance.href = danceObj['Stepsheet Link'];
                dance.target = "_blank";
                dance.rel = "noopener noreferrer";
                dance.innerHTML = danceObj.Dance;
                dataRow.push(dance);
                dataRow.push(danceObj.Choreographer);
                dataRow.push(danceObj.Music);
                dataRow.push(danceObj.Level);
                dataRow.push(danceObj.Memory.toString());
                dataRow.push(danceObj["Month Learned"].concat("/", danceObj["Year Learned"]));
                console.log(dataRow);
                dataSet.push(dataRow);
            };
        };
        createDataTable(dataSet);
    });
};

function createDataTable(dataSet) {
    console.log('Creating table...')
    let dt = new DataTable('#danceList', {
        columns: [
            {title: 'Dance'},
            {title: 'Choreographer'},
            {title: 'Music'},
            {title: 'Level'},
            {title: 'Memory'},
            {title: 'Date Learned'}
        ],
        data: dataSet,
        paging: false,

    });

};



getData();