function checkPalindrome(){
    let input = document.getElementById("text-input").value;
    let inputWithoutNonAlphanumeric = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let inputReverse = "";
    let presult = document.getElementById("result");

    if(!input){
        alert("Please input a value");
    }else{
        for (let i = inputWithoutNonAlphanumeric.length-1; i >= 0; i--) {
            inputReverse = inputReverse+inputWithoutNonAlphanumeric[i];
        }
    
        if (inputWithoutNonAlphanumeric === inputReverse) {
            presult.innerHTML = `${input} is a palindrome`;
        }else{
            presult.innerHTML = `${input} is not a palindrome`;;
        }
    }

}