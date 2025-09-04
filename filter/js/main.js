fetch("data.json")
  .then(response => response.json())
  .then(data => {
    console.log(data); // You can now use this data
    // document.body.insertAdjacentHTML(
    //   "beforeend",
    //   `<pre>${JSON.stringify(data, null, 2)}</pre>`
    // );
  })
  .catch(error => console.error("Error loading JSON:", error));
