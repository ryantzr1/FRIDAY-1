const {spawn} = require('child_process')

async function runMLScript(parameter) {
    return new Promise((resolve, reject) => {
      const python = spawn("python", [
        "Machine Learning/src/main.py",
        parameter,
      ]);
      let output = "";
      python.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
        output += data;
      });
  
      python.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });
  
      python.on("close", (code) => {
        // console.log(`child process exited with code ${code}`);
        const results = output;
        resolve(results);
      });
    });
  }

   
  const response =  runMLScript("What camera does the drone use?"); 
//   console.log(runMLScript("What camera does the drone use?"));

// console.log(response);