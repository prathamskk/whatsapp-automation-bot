import QRCode from "qrcode";

const backendURl = "http://192.168.0.113:3000";
const backendURl1 = "http://localhost:3000";
window.onload = (event) => {
  console.log("page is fully loaded");

  qrbutton = document
    .getElementById("qrbutton")
    .addEventListener("click", getQR);
  logoutbutton = document
    .getElementById("logoutbutton")
    .addEventListener("click", logout);

  addTextToOutput("cool");
  myform = document.getElementById("myform");

  myform.addEventListener("submit", (event) => {
    event.preventDefault();
    const myFilePicker = document.getElementById("phonecsv");
    const myInput = document.getElementById("groupname");

    let file = myFilePicker.files[0];
    if(myInput.value===""){
      return false
    }

    if(myFilePicker.files.length === 0){
      return false
    }

    let formData = new FormData();
    formData.append("file", file);
    formData.append("groupname", myInput.value);

    fetch(backendURl + "/upload_files", {
      method: "POST",
      body: formData,
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.errors) {
          alert(data.errors);
        } else {
          console.log(data);
          addTextToOutput(data.data);
        }
      });
  });
};

const getQR = () => {
  fetch(backendURl + "/qr")
    .then((resp) => resp.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors);
        if (data.errors === "Successfully Logged in") {
          clearCanva()
          let logininfodiv = document.getElementById("logininfo");
          let logininfoname = document.getElementById("logininfoname");
          let logininfonum = document.getElementById("logininfonum");
          logininfodiv.innerText = "Logged in as"
          logininfoname.innerText =`${data.info.pushname}`
          logininfonum.innerText =`${data.info.wid.user}`

        }
      } else {
        var canvas = document.getElementById("qrcode");
        QRCode.toCanvas(canvas, data.qr);
        console.log(data);
        addTextToOutput("qr generated successfully");
      }
    });
};

const logout = () => {
  
  fetch(backendURl + "/logout")
    .then((resp) => resp.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors);
      } else {
        console.log(data);
        addTextToOutput(data.data);
        let logininfodiv = document.getElementById("logininfo");
        let logininfoname = document.getElementById("logininfoname");
        let logininfonum = document.getElementById("logininfonum");
        logininfodiv.innerText = ""
          logininfoname.innerText =""
          logininfonum.innerText =""
          clearCanva()
      }
    });
};

//TODO

// client.on('qr', (qr) => {
//   const canvas = // ...
//   QRCode.toCanvas(canvas, qr, (error) => {
//     // ...
//   })
// })

function addTextToOutput(text) {
  outputDisplay = document.getElementById("output");
  var node = document.createElement("LI");
  var textnode = document.createTextNode(text);
  node.appendChild(textnode);

  outputDisplay.prepend(node);

  node.scrollTop = node.scrollHeight;
}

function clearCanva(){
  var canvas = document.getElementById("qrcode");
  const context = canvas.getContext('2d');
  context.reset();
  canvas.width = 0
  canvas.style.width = 0
  canvas.height = 0
  canvas.style.height = 0
}

const poll = ({ fn, validate, interval, maxAttempts }) => {
  console.log("Start poll...");
  let attempts = 0;

  const executePoll = async (resolve, reject) => {
    console.log("- poll");
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error("Exceeded max attempts"));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
};
