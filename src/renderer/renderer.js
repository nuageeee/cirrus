const { createEditor } = require("./editor")

const editor = createEditor(document.querySelector('#editor'));


const func = async () => {
    const response = await window.versions.ping()
    console.log(response)
}

func()
