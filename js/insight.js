document.addEventListener('DOMContentLoaded', () => {
  fetch("insight.json")
    .then(responce => responce.json())
    .then(data => {
      console.log(data)
    })
})