function getAverage(scores){
    let sumScore = 0;

    for(var i = 0; i < scores.length; i++){
        sumScore = sumScore + scores[i];
    }

    return sumScore/scores.length;
}

console.log(getAverage([92, 88, 12, 77, 57, 100, 67, 38, 97, 89]));
console.log(getAverage([45, 87, 98, 100, 86, 94, 67, 88, 94, 95]));

function getGrade(score){
    if(score < 60){
        return "F";
    }else if(score < 70){
        return "D"
    }else if(score < 80){
        return "C"
    }else if(score < 90){
        return "B"
    }else if(score < 100){
        return "A"
    }else{
        return "A++"
    }
}

console.log(getGrade(96));
console.log(getGrade(82));
console.log(getGrade(56));



function hasPassingGrade(score){
    return getGrade(score) !== "F";
}

console.log(hasPassingGrade(100));
console.log(hasPassingGrade(53));
console.log(hasPassingGrade(87));