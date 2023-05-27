/*
hook all
*/

// print color font
// e.g: console.red(s, "cyan")
(function(){
    let colorFontMap = {
        'bright'    : '\x1B[1m', // 亮色
        'grey'      : '\x1B[2m', // 灰色
        'italic'    : '\x1B[3m', // 斜体
        'underline' : '\x1B[4m', // 下划线
        'reverse'   : '\x1B[7m', // 反向
        'hidden'    : '\x1B[8m', // 隐藏
        'black'     : '\x1B[30m', // 黑色
        'red'       : '\x1B[31m', // 红色
        'green'     : '\x1B[32m', // 绿色
        'yellow'    : '\x1B[33m', // 黄色
        'blue'      : '\x1B[34m', // 蓝色
        'magenta'   : '\x1B[35m', // 品红
        'cyan'      : '\x1B[36m', // 青色
        'white'     : '\x1B[37m', // 白色
    }
    let colorBgMap = {
        'black'   : '\x1B[40m', // 背景色为黑色
        'red'     : '\x1B[41m', // 背景色为红色
        'green'   : '\x1B[42m', // 背景色为绿色
        'yellow'  : '\x1B[43m', // 背景色为黄色
        'blue'    : '\x1B[44m', // 背景色为蓝色
        'magenta' : '\x1B[45m', // 背景色为品红
        'cyan'    : '\x1B[46m', // 背景色为青色
        'white'   : '\x1B[47m', // 背景色为白色
    }
    let reset = "\x1B[0m"

    Object.keys(colorFontMap).forEach((color)=>{
        console[color] = function(msg, bgColor){
            console.log(`${colorFontMap[color]}${bgColor ? colorBgMap[bgColor] : ''}${msg}${reset}`);
        }    
    });
})()


// remove duplicates from array
function uniqBy(array, key) 
{
	var seen = {};
	return array.filter(function(item) {
		var k = key(item);
		return seen.hasOwnProperty(k) ? false : (seen[k] = true);
	});

}


function trace(pattern){
    // pattern: 声明

    let type = (pattern.toString().indexOf("!") === -1) ? "objc" : "module";
    console.bright(`Instrumenting: ${pattern} - ${type}`); 

    let resolver = new ApiResolver(type);
    let matches = resolver.enumerateMatches(pattern);

    matches.forEach((matche) => {
        // hook
        Interceptor.attach(matche.address, {
            onEnter: function(args){
                
                console.green("\n================================================");
                
                console.yellow(`*** [${this.threadId}] Enter: ${matche.name} (${matche.address})\n`);

                // 类
                let handle = new ObjC.Object(args[0]);
                // 父类
                let superHandle = handle.$superClass;
                // 类型
                let kind = handle.$kind;
                // 函数
                // let selector = args[1];

                console.cyan(`Called: ${matche.name} | kind: ${kind} | super: ${superHandle.$className}`);                

                // 参数
                let argsCount = (matche.name.match(/:/g) || []).length;
                console.cyan(`Arguments: ${argsCount}`);
                for(let i=2;i<2+argsCount;i++){
                    console.cyan(`\t${i-2} => ${ObjC.Object(args[i])} (${args[i]})`);
                }

                // 调用堆栈
                console.cyan("\nBacktrace:\n\t" + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t') + '\n');
                
            },
            onLeave: function(retval){
                console.magenta(`Return: ${matche.name} (${matche.address}) => ${ObjC.Object(retval)} (${retval})`);
                
                console.yellow(`\n*** [${this.threadId}] Exit: ${matche.name} (${matche.address})`);

                console.green("================================================\n");

                return retval;
            },
        });
    });

        
}


// main
setImmediate(() => {
    if (ObjC.available){

        // trace("+[Tools md5Encrypt:]"); // 测试

    }
})

