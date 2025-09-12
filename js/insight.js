document.addEventListener('DOMContentLoaded', () => {
  fetch("insight.json")
    .then(responce => responce.json())
    .then(data => {
      const outers = document.querySelectorAll('.dropdown-outer .select-wrap');
      const postcontainer = document.querySelector('.insights-filter .card-outer .wrapper');
      // const paginationContainer = document.querySelector(".ajax-pagination");
      const posts = data;



      const handleClick = () => {
        outers.forEach(el => {
          el.addEventListener('click', function (e) {
            if (e.target.closest('.option-wrap')) {
              return;
            }

            const option = this.querySelector('.option-wrap');
            const wasActive = this.classList.contains('active');

            outers.forEach(o => {
              o.classList.remove('active');
              const opt = o.querySelector('.option-wrap');
              if (opt) opt.classList.remove('open');
            });

            if (!wasActive) {
              this.classList.add('active');
              if (option) option.classList.add('open');
            }
          })
        });
      };

      const updateList = () => {

        const makeUniqueList = (arr) => [...new Set(arr.map(item => item.trim()).filter(Boolean))];

        // collect all data and remove ,
        const allAudiences = data.flatMap(item =>
          item.field_audience ? item.field_audience.split(",") : []
        );
        const allProducts = data.flatMap(item =>
          item.field_product ? item.field_product.split(",") : []
        );

        const contenttypes = [...new Set(data.map(item => item["field_content_type"]))];
        const authortypes = [...new Set(
          data
            .map(item => {
              if (!item.field_author) return null;
              const temp = document.createElement("div");
              temp.innerHTML = item.field_author;
              let text = temp.textContent.trim();
              return text.split(",")[0].trim();
            })
            .filter(Boolean)
        )];


        const uniqueAudiences = makeUniqueList(allAudiences);
        const uniqueProducts = makeUniqueList(allProducts);



        const buildList = (listContainer, items) => {
          listContainer.innerHTML = "";
          items.forEach(type => {
            const safeId = type.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-_]/g, "");

            const li = document.createElement("li");
            const row = document.createElement("div");
            const wrap = document.createElement("div");
            const textwithnum = document.createElement("div");
            const span = document.createElement("span");

            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = safeId;

            const label = document.createElement("label");
            label.htmlFor = safeId;
            label.textContent = type;

            row.classList.add("checkbox-row");
            wrap.classList.add("checkbox-wrap");
            textwithnum.classList.add("text-with-num");
            textwithnum.appendChild(span)
            span.textContent = type;

            li.appendChild(row);
            row.appendChild(wrap);
            wrap.appendChild(input);
            wrap.appendChild(label);
            row.appendChild(textwithnum);

            // if you want extra info (like count) in text-with-num
            // textwithnum.textContent = "(0)";  

            listContainer.appendChild(li);
          });
        };

        buildList(document.querySelector("#audienceList"), uniqueAudiences);
        buildList(document.querySelector("#productList"), uniqueProducts);
        buildList(document.querySelector("#content-typeList"), contenttypes);
        buildList(document.querySelector("#authorList"), authortypes);
      }

      const renderPost = (posts) => {
        if (!posts || posts.length === 0) {
          postcontainer.innerHTML = `<p class="text-center text-gray-600">No posts found</p>`;
          // paginationContainer.innerHTML = "";
          return;
        }
        console.log(posts);


        postcontainer.innerHTML = posts.map(post => {
          // extract image URL
          let imgUrl = "";
          if (post.field_dam_image) {
            const temp = document.createElement("div");
            temp.innerHTML = post.field_dam_image;
            const img = temp.querySelector("img");
            imgUrl = img ? img.src : "";
          }

          // extract author
          let authorText = "";
          let authorLink = "#";
          if (post.field_author) {
            const temp = document.createElement("div");
            temp.innerHTML = post.field_author;
            const link = temp.querySelector("a");
            if (link) {
              authorText = link.textContent.trim();
              authorLink = link.getAttribute("href");
            } else {
              authorText = temp.textContent.trim();
            }
          } else if (post.guest_author) {
            authorText = post.guest_author;
          }

          // extract date text
          let dateText = "";
          if (post.created) {
            const temp = document.createElement("div");
            temp.innerHTML = post.created;
            const time = temp.querySelector("time");
            dateText = time ? time.textContent.trim() : "";
          }

          // read time
          let readTime = post.field_zip_code ? `${post.field_zip_code.trim()} MIN` : "";

          return `
          <div class="col-three relative w-[calc(33.33%-24px)] mx-[12px] mb-[50px] pt-[150px] min-h-[480px] hover:shadow-lg transition-all duration-300 ease-in-out">
            <a href="${post.view_node}" class="emptylink z-[5]">.</a>
            <div class="card-wrap pt-[100px] relative w-full h-full px-[24px] pb-[78px] rounded-[8px] bg-white">
              <div class="img-box absolute left-[50%] top-[-40px] -translate-x-1/2 -translate-y-1/2 transform max-w-[400px] w-full h-[220px] mb-[31px] rounded-[8px] overflow-hidden z-[1] transition-all duration-300 ease-in-out">
                <img src="${imgUrl}" alt="${post.title} class="w-full h-full object-cover transition-all duration-300 ease-in-out">
              </div>
              <div class="text-box">
                <div class="caption">
                  <span class="date mr-[21px] relative inline-block text-[14px] font-bold text-[#009dd1] uppercase">${dateText}</span>
                  <span class="location font-medium mr-[8px] text-[14px] relative text-[#009dd1] uppercase">${readTime}</span>
                </div>
                <h5 class="mt-[10px] text-[24px] font-normal text-[#002a3b] transiton-all duration-300 ease-in-out">${post.title}</h5>
                ${authorText ? `<span class="author text-[14px] font-normal mt-[12px] block text-[#002a3b]">by <a href="${authorLink}" class="text-[14px] font-normal text-[#005677] inline-block underline relative">${authorText}</a></span>` : ""}
                <div class="link-outer absolute bottom-[32px] block z-[4]">
                  <a href="${post.view_node}" class="z-[6] link-arrow text-[#005677] text-[18px] font-semibold relative transiton-all duration-300 ease-in-out">Read the article</a>
                </div>
              </div>
            </div>
          </div>`;
        }).join("");

      }

      handleClick()
      updateList()
      renderPost(posts)
    })
})