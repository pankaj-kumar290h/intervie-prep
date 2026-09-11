const swap =(arr,pos1,pos2)=>{

    let temp = arr[pos1];
    arr[pos1]= arr[pos2];
    arr[pos2]=temp

}

const reverse =(arr,start,end)=>{ 
   while(start<=end){
     swap(arr,start,end);
     start++;
     end--;
   }
}


const rotate =(arr,index)=>{
    reverse(arr,index,arr.length-1);
    reverse(arr,0,index-1);

    reverse(arr,0,arr.length-1);


    console.log(arr);
}


rotate([1,2,3,4,5],1
);