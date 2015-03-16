function Info(){

}

/**
 * 保存对应元素
 */
Info.prototype.save=function (){

}

/**
 *  删除对应元素
 * @param value
 */
Info.prototype.del=function(data ,value){

    if(data==undefined){
        data = new Array();
    }
    var length =  data.length;
    var index= 0;
    if(value==null || data.length==0) return ;
    if(length){
        for(var i= 0;i<length;i++){
            if(data[i]==value){
                index =i ;
                //删除元素
                data.splice(index,1);
            }
        }
        var indexs ;
        if(data){
            for(var m=0;m<data.length;m++){
                if(data[m]==null && data[m]==undefined){
                    indexs = m ;
                    data.splice(indexs,1);
                }
            }
        }
        return data;

    }else{
        return false;
    }

}
/**
 * 查找数组
 * @param data
 * @param value
 * @returns {boolean}
 */
Info.prototype.find=function (data,value){
    var flag= false;
    if(data.length==0)  return ;
    for(var i =0;i<data.length;i++){
        if(data[i]==value){
            flag= true;
        }
    }
    return flag;
}

/**
 * 判断是否在数组中的元素
 * @param data
 * @param value
 * @returns {boolean}
 */
Info.prototype.in_array=function (data,value){
    if(data.length==0 || data==undefined) return;
    var flag = false;
    for(var i=0 ; i<data.length;i++){
        if(data[i]==value){
            flag = true;
        }
    }
    return flag;
}
module.exports = Info;