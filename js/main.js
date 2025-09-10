document.addEventListener("DOMContentLoaded", () => {
  const selectboxs = document.querySelectorAll('.selectbox');
  const postcontainer = document.querySelector('#post-container .wrapper');
  const currentpost = document.querySelector('.current-filter');
  const sectionContainer = document.querySelector('#filter-form');
  const paginationContainer = document.querySelector(".ajax-pagination");

  const typebox = selectboxs[0].querySelector(".box");
  const typelist = selectboxs[0].querySelector(".selectbox-list");
  const catbox = selectboxs[1].querySelector(".box");
  const catlist = selectboxs[1].querySelector(".selectbox-list");

  let currentPage = 1;
  const postsPerPage = 12;
  let filteredPosts = [];

  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      const uniquetypes = [...new Set(data.map(item => item["all-types"]))];
      const uniqueCat = [...new Set(data.map(item => item["all-cat"]))];
      const posts = data.filter(item => item.userId === 1);

      filteredPosts = posts;
      renderpost(filteredPosts);

      function renderlist() {
        typelist.innerHTML = "";
        catlist.innerHTML = "";

        uniquetypes.forEach((type, index) => {
          if (type) {
            const li = document.createElement("li");
            li.textContent = type;
            li.className = "relative bg-white text-[#282728] text-[16px] font-normal pl-[24px] py-[14px] hover:bg-[#eb00004d] hover:text-[#eb0000] cursor-pointer capitalize";
            if (index === 0) {
              li.classList.add("selected");
              typebox.textContent = type;
            }
            li.addEventListener("click", () => {
              typelist.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
              li.classList.add("selected");
              typebox.textContent = type;
              applyfilter();
            });
            typelist.appendChild(li);
          }
        });

        uniqueCat.forEach((cat, index) => {
          if (cat) {
            const li = document.createElement("li");
            li.textContent = cat;
            li.className = "relative bg-white text-[#282728] text-[16px] font-normal pl-[24px] py-[14px] hover:bg-[#eb00004d] hover:text-[#eb0000] cursor-pointer capitalize";
            if (index === 0) {
              li.classList.add("selected");
              catbox.textContent = cat;
            }
            li.addEventListener("click", () => {
              catlist.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
              li.classList.add("selected");
              catbox.textContent = cat;
              applyfilter();
            });
            catlist.appendChild(li);
          }
        });
      }

      function applyfilter() {
        let filtered = posts;
        const selectedType = typebox.textContent.trim().toLowerCase();
        const selectedCat = catbox.textContent.trim().toLowerCase();

        if (selectedType && selectedType !== "all types") {
          filtered = filtered.filter(post => post.tag && post.tag.toLowerCase() === selectedType);
        }

        if (selectedCat && selectedCat !== "all categories") {
          filtered = filtered.filter(post => post.cat && post.cat.toLowerCase() === selectedCat);
        }

        filteredPosts = filtered;
        currentPage = 1;
        // renderlist(selectedType, selectedCat);
        renderpost(filteredPosts);
        currentposts(typebox.textContent.trim(), catbox.textContent.trim());
      }

      function toggleclk() {
        selectboxs.forEach(selectbox => {
          if (selectbox) {
            var list = selectbox.querySelector('.selectbox-list');
            selectbox.addEventListener('click', () => {
              selectbox.classList.toggle('active');
              list.classList.toggle('open');
            });
          }
        });
      }

      function renderpost(posts) {
        postcontainer.innerHTML = "";

        if (posts.length === 0) {
          postcontainer.innerHTML = `<p class="text-center text-gray-600">No posts found</p>`;
          paginationContainer.innerHTML = "";
          return;
        }

        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        const paginatedPosts = posts.slice(start, end);

        paginatedPosts.forEach(post => {
          const col = document.createElement("div");
          col.className = "col-three lg:w-[calc(33.33%-24px)] w-full sm:w-[calc(50%-24px)] mx-[12px] mb-6";

          col.innerHTML = `
            <div class="card relative border-silver border-2 rounded-[5px] overflow-hidden hover:shadow-lg h-full min-h-[490px]">
              <a href="${post.url}" class="emptylink">.</a>
              <div class="img-wrap w-full h-[230px]">
                <img src="${post.img || '/images/lightbeam.png'}" alt="img" class="w-full h-full object-cover">
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
        });

        renderPagination(posts.length);
      }

      function renderPagination(totalPosts) {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        if (totalPages <= 1) return;

        // Prev button
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.className = `px-4 py-2 rounded-md border ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black"}`;
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            renderpost(filteredPosts);
            sectionContainer.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
        paginationContainer.appendChild(prevBtn);

        // Number buttons
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.className = `px-4 py-2 rounded-md border ${i === currentPage ? "bg-[#eb0000] text-white" : "bg-white text-black"}`;
          btn.addEventListener("click", () => {
            currentPage = i;
            renderpost(filteredPosts);
            sectionContainer.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          paginationContainer.appendChild(btn);
        }

        // Next button
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.className = `px-4 py-2 rounded-md border ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black"}`;
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderpost(filteredPosts);
            sectionContainer.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
        paginationContainer.appendChild(nextBtn);
      }

      function currentposts(selectedType, selectedCat) {
        currentpost.innerHTML = "";

        if (selectedType && selectedType.toLowerCase() !== "all types") {
          const typeTag = document.createElement("span");
          typeTag.className = "tag bg-[#2EB67D] text-[16px] font-normal pl-[12px] pr-[33px] py-[7px] mr-2 rounded-[50px] relative";
          typeTag.innerHTML = `${selectedType} <button class="remove-filter cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-darkGray text-[28px]" data-filter="type">×</button>`;
          currentpost.appendChild(typeTag);
        }

        if (selectedCat && selectedCat.toLowerCase() !== "all categories") {
          const catTag = document.createElement("span");
          catTag.className = "tag bg-[#2EB67D] text-[16px] font-normal pl-[12px] pr-[33px] py-[7px] mr-2 rounded-[50px] relative";
          catTag.innerHTML = `${selectedCat} <button class="remove-filter cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-darkGray text-[28px]" data-filter="cat">×</button>`;
          currentpost.appendChild(catTag);
        }

        const clearbtns = document.querySelectorAll('.remove-filter');
        clearbtns.forEach(btn => {
          btn.addEventListener('click', () => {
            if (btn.dataset.filter === "type") {
              const firstType = typelist.querySelector("li");

              if (firstType) {
                typebox.textContent = firstType.textContent;
                typelist.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
                firstType.classList.add("selected");
              }

            } else if (btn.dataset.filter === "cat") {
              const firstCat = catlist.querySelector("li");
              if (firstCat) {
                catbox.textContent = firstCat.textContent;
                catlist.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
                firstCat.classList.add("selected");
              }
            }

            applyfilter();
            const selectedType = typebox.textContent.trim();
            const selectedCat = catbox.textContent.trim();
            if (selectedType !== "All Types" || selectedCat !== "All Categories") {
              const typeVal = selectedType !== "All Types" ? selectedType : "";
              const catVal = selectedCat !== "All Categories" ? selectedCat : "";
              currentposts(typeVal, catVal);
            } else {
              currentpost.innerHTML = "";
            }
          });
        });
      }

      renderlist();
      toggleclk();

    })
    .catch(error => console.error("Error loading JSON:", error));
});
