document.addEventListener("DOMContentLoaded", () => {
  const selectboxs = document.querySelectorAll('.selectbox')

  const typebox = selectboxs[0].querySelector(".box");
  const typelist = selectboxs[0].querySelector(".selectbox-list")

  const catbox = selectboxs[1].querySelector(".box");
  const catlist = selectboxs[1].querySelector(".selectbox-list")

  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      const uniquetypes = [...new Set(data.map(item => item["all-types"]))]
      const uniqueCat = [...new Set(data.map(item => item["all-cat"]))]


      uniquetypes.forEach(type => {
        if (type) {
          const li = document.createElement("li");
          li.textContent = type;
          li.className =
            "relative bg-white text-[#282728] text-[16px] font-normal pl-[24px] py-[14px] hover:bg-gray-100 cursor-pointer capitalize";
          typelist.appendChild(li);
        }
      })

      uniqueCat.forEach(cat => {
        if (cat) {
          const li = document.createElement("li");
          li.textContent = cat;
          li.className =
            "relative bg-white text-[#282728] text-[16px] font-normal pl-[24px] py-[14px] hover:bg-gray-100 cursor-pointer capitalize";
          catlist.appendChild(li)
        }
      })

    })
    .catch(error => console.error("Error loading JSON:", error));
});