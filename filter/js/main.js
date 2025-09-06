document.addEventListener("DOMContentLoaded", () => {
  const selectboxs = document.querySelectorAll('.selectbox')
  const postcontainer = document.querySelector('#post-container .wrapper')


  const typebox = selectboxs[0].querySelector(".box");
  const typelist = selectboxs[0].querySelector(".selectbox-list")

  const catbox = selectboxs[1].querySelector(".box");
  const catlist = selectboxs[1].querySelector(".selectbox-list")

  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      const uniquetypes = [...new Set(data.map(item => item["all-types"]))]
      const uniqueCat = [...new Set(data.map(item => item["all-cat"]))]
      const posts = data.filter(item => item.userId === 1);

      renderpost(posts);

      uniquetypes.forEach(type => {
        if (type) {
          const li = document.createElement("li");
          li.textContent = type;
          li.className =
            "relative bg-white text-[#282728] text-[16px] font-normal pl-[24px] py-[14px] hover:bg-[#eb00004d] hover:text-[#eb0000] cursor-pointer capitalize transition-all duration-300 ease-in-out";
          typelist.appendChild(li);
        }
      })

      uniqueCat.forEach(cat => {
        if (cat) {
          const li = document.createElement("li");
          li.textContent = cat;
          li.className =
            "relative bg-white text-[#282728] text-[16px] font-normal pl-[24px] py-[14px] hover:bg-[#eb00004d] hover:text-[#eb0000] cursor-pointer capitalize transition-all duration-300 ease-in-out";
          catlist.appendChild(li)
        }
      })


      function applyfilter() {
        let filtered = posts;
        const selectedType = typebox.textContent.trim().toLowerCase();
        const selectedCat = catbox.textContent.trim().toLowerCase();

        if (selectedType && selectedType !== "all types") {
          filtered = filtered.filter(post =>
            post.tag && post.tag.toLowerCase() === selectedType
          );
        }

        if (selectedCat && selectedCat !== "all categories") {
          filtered = filtered.filter(post =>
            post.cat && post.cat.toLowerCase() === selectedCat
          );
        }

        renderpost(filtered); // ✅ only call once
      }

      function typelisting() {
        const typeItems = typelist.querySelectorAll("li");
        if (typeItems.length > 0) {
          typeItems[0].classList.add('selected')
          typebox.textContent = typeItems[0].textContent;
        }

        typeItems.forEach(item => {
          item.addEventListener('click', function () {
            typeItems.forEach(el => el.classList.remove("selected"));
            item.classList.add('selected')
            typebox.textContent = item.textContent
            applyfilter();
          })
        })
      }

      function catlisting() {
        const catitems = catlist.querySelectorAll("li");
        if (catitems.length > 0) {
          catitems[0].classList.add('selected')
          catbox.textContent = catitems[0].textContent;
        }

        catitems.forEach(item => {
          item.addEventListener('click', function () {
            catitems.forEach(el => el.classList.remove("selected"));
            item.classList.add('selected')
            catbox.textContent = item.textContent
            applyfilter()
          })
        })
      }

      function toggleclk() {
        selectboxs.forEach(selectbox => {
          if (selectbox) {
            var list = selectbox.querySelector('.selectbox-list ');
            selectbox.addEventListener('click', function () {
              selectbox.classList.toggle('active');
              list.classList.toggle('open');
            })
          }
        })
      }

      function renderpost(posts) {
        postcontainer.innerHTML = "";

        if (posts.length === 0) {
          postcontainer.innerHTML = `<p class="text-center text-gray-600">No posts found</p>`;
          return;
        }

        posts.forEach(post => {
          const col = document.createElement("div");
          col.className = "col-three w-[calc(33.33%-24px)] mx-[12px] mb-6";

          col.innerHTML = `
        <div class="card relative border-silver border-2 rounded-[5px] overflow-hidden hover:shadow-lg h-full min-h-[490px]">
          <a href="${post.url}" class="emptylink">.</a>
          <div class="img-wrap w-full h-[230px]">
            <img src="${post.img || '/filter/images/lightbeam.png'}" alt="img" class="w-full h-full object-cover">
          </div>
          <div class="content-wrap p-4">
            <div class="bts-wrap flex items-center gap-8 mb-4">
              <span class="text-[14px] text-[#282728] font-bold">${post.date}</span>
              <span class="bg-[#ECB22E] text-black text-[14px] font-bold px-4 py-1 rounded-[15px] uppercase">${post.tag}</span>
            </div>
            <h5 class="font-semibold text-[#282728] mb-2 text-[24px]">${post.title}</h5>
            <a href="${post.url}" class="font-semibold absolute bottom-[20px] left-4 text-lg hover:text-black mt-auto">${post["link-txt"]}</a>
          </div>
        </div>
      `;
          postcontainer.appendChild(col);
        })
      }

      typelisting();
      catlisting()
      toggleclk()
    })
    .catch(error => console.error("Error loading JSON:", error));
});