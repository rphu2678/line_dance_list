
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
                let danceObj = danceList[danceId];
                let dataRow = [];
                let dance = document.createElement('a');
                dance.href = danceObj['Stepsheet Link'];
                dance.target = "_blank";
                dance.rel = "noopener noreferrer";
                dance.innerHTML = danceObj.Dance;
                dataRow.push(dance);
                dataRow.push(danceObj.Choreographer);
                dataRow.push(danceObj.Music);
                dataRow.push(danceObj.Level);
                dataRow.push(danceObj.Memory.toString());
                let dance_date = "";
                if (danceObj["Month Learned"] || danceObj["Year Learned"]) {
                    dance_date = danceObj["Month Learned"].concat(" ", danceObj["Year Learned"]);
                }

                dataRow.push(dance_date);

                dataSet.push(dataRow);
                console.log(typeof(danceObj.Level));
                console.log(typeof(danceObj["Month Learned"].concat(" ", danceObj["Year Learned"])));
            };
        };
        createDataTable(dataSet);
    });
};


function getLocalData() {
    fetch('./static/line-dance-db.json')
        .then(res => res.json())
        .then(danceList => {
            for (let danceId in danceList) {
                console.log(danceId);
                let danceObj = danceList[danceId];
                console.log(danceObj);
                let dataRow = [];
                let dance = document.createElement('a');
                dance.href = danceObj['Stepsheet Link'];
                dance.target = "_blank";
                dance.rel = "noopener noreferrer";
                dance.innerHTML = danceObj.Dance;
                dataRow.push(dance);
                dataRow.push(danceObj.Choreographer);
                dataRow.push(danceObj.Music);
                dataRow.push(danceObj.Level);
                dataRow.push(danceObj.Memory.toString());
                let dance_date = "";
                if (danceObj["Month Learned"] || danceObj["Year Learned"]) {
                    dance_date = danceObj["Month Learned"].concat(" ", danceObj["Year Learned"]);
                }

                dataRow.push(dance_date);

                dataSet.push(dataRow);
                console.log(typeof(danceObj.Level));
                console.log(typeof(danceObj["Month Learned"].concat(" ", danceObj["Year Learned"])));
            };
            createDataTable(dataSet);
        })
};

function createDataTable(dataSet) {
    DataTable.datetime("MMMM YYYY");
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
        order: [[5, 'desc']],
        orderFixed: {
            post: [0, 'asc'],
        },
    });

};



// getData();
getLocalData();