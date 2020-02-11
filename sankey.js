/**
 * Created by sky on 2020/2/11.
 */


const color = "#b1b1b1";
// label
let div = d3.select("body").append("div")
    .attr("class", "stooltip")
    .style("opacity", 0);



//起始时间
const startDate = Date.parse("2020-01-23");
const endDate = Date.parse("2020-02-11");




//基础画布设置
const margin = {top: 30, right: 10, bottom: 50, left: 50};
const width = document.body.clientWidth * 0.8;
const height = document.body.clientWidth*3;

const svg = d3.select("#sankey")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class","sankeyg");


//比例尺
let xScale = d3.scaleTime()
    .range([0, width])
    .domain([startDate, endDate]);



//时间轴

const xAxis = d3.axisBottom(xScale);

const xAxisGroup = svg.append("g").attr("transform", "translate(0," + -20 + ")");
const xAxisNodes = xAxisGroup.call(xAxis);
xAxisNodes.selectAll('.tick text')
    .attr("fill", "#555555");






let data;
let specificData;
d3.json("data/allProvince.json",function(d){
    data = d
    drawSankey(d,'confirmed')
    d3.select("#return").on("click",()=>drawSankey(data,'confirmed'));

});

d3.json("data/allProvince_city.json",function(d){
    specificData = d
})







function drawSankey(data,type) {

    d3.select("#confirmButton").on("click",()=>drawSankey(data,'confirmed'));
    d3.select("#curedButton").on("click",()=>drawSankey(data,'cured'));
    d3.select("#deadButton").on("click",()=>drawSankey(data,'dead'));

    //数据处理
    const itemId = getId(data);
    const data_ = getData(data)
    let yScale = d3.scaleLinear()
        .range([1,100])
        .domain([0,getMaxValue(data,type)]);

    const finalData = cal_y(data_,type,yScale);
    console.log(finalData)

    svg.selectAll(".paths").remove();
    svg.selectAll(".rects").remove();


    // add rect
    let rects = svg.append("g").attr("class","rects");

    for(i in finalData){
        rects.append("g")
            .selectAll("rect"+i)
            .data(finalData[i])
            .enter()
            .append("rect")
            .attr("width",10)
            .attr("height",function(d,i){
                if(d[type]!==0){
                    return yScale(d[type])
                }
                else{
                    return 1;
                }
            })
            .attr("fill",color)
            .attr("x", (d,i)=>{
                return xScale(Date.parse(d.time+" 00:00:00"))
            })
            .attr("y",(d)=>d.y)
            .attr("class",(d,i)=>{
                return "type_"+itemId.indexOf(d.loc)
            })
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)
            .on("dblclick",dblclick)

    }



    // addpath
    let paths = svg.append("g").attr("class","paths");

    let scale = d3.scaleLinear()
        .domain([-1,1])
        .range([0,1]);


    for(let i=0;i<Object.keys(itemId).length;i++){
        let classname = "type_"+i;
        let thisCity = svg.selectAll("."+classname);

        let thisCityData = [];
        let areaPath = d3.area()
            .x((d,i)=>d.x)
            .y0((d,i)=>d.y0)
            .y1((d,i)=>d.y1)
            .curve(d3.curveCatmullRom.alpha(0.5));
        let lasty = 0;

        thisCity.each(function(d,i){
            // if(d.value>=3){
            let value = parseInt(d3.select(this).attr("height"));
            let x = parseInt(d3.select(this).attr("x"));
            let y0 = parseInt(d3.select(this).attr("y")) + parseInt(d3.select(this).attr("height"))
            let y1 = y0 - d3.select(this).attr("height");
            let change = (value-lasty)/lasty;
            lasty = value;
            thisCityData.push({
                'x':x,
                'y0':y0,
                'y1':y1,
            })


        });
        paths.append("path")
            .attr("d",areaPath(thisCityData))
            .attr("class","path_"+classname)
            .attr("fill",color)
            .style("opacity",0.5)
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)
            .on("dblclick",dblclick)

    }

    document.querySelector(".sankeyg").insertBefore(document.querySelector(".paths"),document.querySelector(".rects"))



    function mouseover(){
        let classname = d3.select(this).attr("class");
        let classnameArray = classname.split("_");
        let index = classnameArray[classnameArray.length-1]
        let cityName = itemId[index];
        let number = ""
        // let time = Date.parse(xScale.invert(d3.select(this).attr("x")))

        if(d3.select(this).attr("height")){
            number = parseInt(yScale.invert(d3.select(this).attr("height")))
        }





        svg.selectAll("rect").style("opacity", .5);
        svg.selectAll("."+classname).style("opacity", 1);

        svg.select(".paths").selectAll("path").style("opacity",0);
        svg.selectAll(".path_type_"+index).style("opacity",0.4);



        div.transition()
            .duration(200)
            .style("opacity", .9);

        div.html(cityName +" "+number + "<br/>")
            .style("left", function(d,i){
                // if(d3.event.pageX+550>document.body.clientWidth){
                //     return (d3.event.pageX-550)+"px"
                // }
                // else return (d3.event.pageX +50) + "px"
                return d3.event.pageX+50+"px"
            })
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseout(){

        let classname = d3.select(this).attr("class");


        svg.selectAll("rect").style("opacity", 1);
        svg.selectAll("path").style("opacity",0.4)

        div.transition()
            .duration(200)
            .style("opacity", .0);
    }

    function dblclick(){
        let classname = d3.select(this).attr("class");
        let classnameArray = classname.split("_");
        let index = classnameArray[classnameArray.length-1]
        let cityName = itemId[index];

        drawSankey(specificData[cityName],'confirmed')
    }

}

