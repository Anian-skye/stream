/**
 * Created by sky on 2020/2/11.
 */
function cal_y(data,type,yScale){

    function sortType(property){
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value2 - value1;
        }
    }

    for(i in data){
        data[i].sort(sortType(type));
        let currentY = 0

        for(item in data[i]){
            data[i][item]['y'] = currentY;
            value = data[i][item][type];
            currentY+=yScale(value)+10
        }
    }
    return data

}



function getId(data){
    let items = []
    for(i in data){
        for(p in data[i]){
            if(!items.hasOwnProperty(p)){
                if(items.indexOf(p)<0)
                    items.push(p)
            }

        }
    }
    return items
}

function getData(data){
    let results = [];
    for(i in data){
        let thisDay = []
        for(value in data[i]){
            let newObj = data[i][value]
            newObj.loc = value
            newObj.time = i
            thisDay.push(newObj)
        }
        results.push(thisDay)
    }
    return results
}

function getMaxValue(data,type){
    function sortNumber(a,b)
    {
        return a - b
    }
    let allData = []
    for(i in data){
        for(value in data[i]){
            allData.push(parseInt(data[i][value][type]))
        }
    }
    a = allData.sort(sortNumber);
    return a[a.length-1]
}



