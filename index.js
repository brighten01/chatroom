var redis =require("redis"),
    client = redis.createClient();

client.set("key","value",function (error,result){
    if(error){
        console.log(error);
        return false;
    }
    console.log(result);
});


client.get("key",function (error,result){
    if(error){
        console.log(error);
    }
    console.log(result);

});

client.hmset("key1","website","google.com",function (error,result){
        if(error){
            console.log(error);
            return false;
        }
    console.log(result);
});

client.hmget("key1","website",function (error,result){
    if(error){
        console.log(error);
        return false;
    }
    console.log(result);
});

client.del("key",function (error,removed){
        if(error){
            console.log(error);
        }
    console.log(removed);
});


client.zadd("page_rank",10,"www.google.com",function (error,result){
    console.log(result);
});

/**
 * 排序
 */

client.zrange("page_rank","0","-1","withscores",function (error,result){
    console.log(result);
});