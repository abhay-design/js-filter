document.addEventListener('DOMContentLoaded', () => {
  fetch("insight.json")
    .then(responce => responce.json())
    .then(data => {
      const outers = document.querySelectorAll('.dropdown-outer .select-wrap');
      const postcontainer = document.querySelector('.insights-filter .card-outer .wrapper');
      // const paginationContainer = document.querySelector(".ajax-pagination");
      const posts = data;


      // clicking funtion for the lists
      const handleClick = () => {
        outers.forEach(el => {
          el.addEventListener('click', function (e) {
            if (e.target.closest('.option-wrap')) {
              return;
            }

            const option = this.querySelector('.option-wrap');
            const wasActive = this.classList.contains('active');
            const checkedrows = el.querySelectorAll(".select-wrap .option-wrap .checkbox-row")
            if (checkedrows) {
              checkedrows.forEach(row => {
                row.addEventListener('click', function (e) {
                  e.stopPropagation();
                  var inpt = this.querySelector("input")
                  if (inpt) {
                    inpt.checked = !inpt.checked; // ✅ toggle checked
                  }
                  applyFilter()
                })
              })
            }

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

      // added value from date into the list
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
        const uniqueContenttypes = makeUniqueList(contenttypes)
        const normalize = str => str.toLowerCase().trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-_]/g, "");



        const buildList = (listContainer, items, key) => {
          listContainer.innerHTML = "";
          items.forEach(type => {
            const safeId = normalize(type);

            let countNum = 0;
            data.forEach(post => {
              let values = [];
              if (key === "field_audience" || key === "field_product") {
                values = (post[key] || "").split(",").map(v => normalize(v));
              } else if (key === "field_content_type") {
                values = [normalize(post[key] || "")];
              } else if (key === "field_author") {
                const temp = document.createElement("div");
                temp.innerHTML = post.field_author || "";
                const authorText = temp.textContent.trim();
                values = [normalize(authorText.split(",")[0])];
              }
              if (values.includes(safeId)) {
                countNum++;
              }
            });

            const li = document.createElement("li");
            const row = document.createElement("div");
            const wrap = document.createElement("div");
            const textwithnum = document.createElement("div");
            const span = document.createElement("span");
            const count = document.createElement("span")

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
            textwithnum.appendChild(count)
            count.classList.add("categories-count")
            span.textContent = type;
            count.textContent = `(${countNum})`;





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


        buildList(document.querySelector("#audienceList"), uniqueAudiences, "field_audience");
        buildList(document.querySelector("#productList"), uniqueProducts, "field_product");
        buildList(document.querySelector("#content-typeList"), uniqueContenttypes, "field_content_type");
        buildList(document.querySelector("#authorList"), authortypes, "field_author");
      }

      // print all the cards
      const renderPost = (posts) => {
        if (!posts || posts.length === 0) {
          postcontainer.innerHTML = `<p class="text-center text-gray-600">No posts found</p>`;
          // paginationContainer.innerHTML = "";
          return;
        }
        // console.log(posts);


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

      const applyFilter = () => {
        // Collect checked filters grouped by type
        const audienceChecked = Array.from(document.querySelectorAll("#audienceList input:checked")).map(i => i.id);
        const productChecked = Array.from(document.querySelectorAll("#productList input:checked")).map(i => i.id);
        const contentChecked = Array.from(document.querySelectorAll("#content-typeList input:checked")).map(i => i.id);
        const authorChecked = Array.from(document.querySelectorAll("#authorList input:checked")).map(i => i.id);

        let filtered = posts.filter(post => {
          let keep = true;

          // Audience filter (OR logic)
          if (audienceChecked.length) {
            keep = audienceChecked.some(id =>
              (post.field_audience || "").toLowerCase().includes(id.replace(/-/g, " "))
            );
          }

          // Product filter (AND with audience if both chosen)
          if (keep && productChecked.length) {
            keep = productChecked.some(id =>
              (post.field_product || "").toLowerCase().includes(id.replace(/-/g, " "))
            );
          }

          // Content type filter
          if (keep && contentChecked.length) {
            keep = contentChecked.some(id =>
              (post.field_content_type || "").toLowerCase().includes(id.replace(/-/g, " "))
            );
          }

          // Author filter
          if (keep && authorChecked.length) {
            // note: field_author contains HTML, so strip tags
            const temp = document.createElement("div");
            temp.innerHTML = post.field_author || "";
            const authorText = temp.textContent.trim().toLowerCase();

            keep = authorChecked.some(id => authorText.includes(id.replace(/-/g, " ")));
          }

          return keep;
        });
        console.log(filtered);


        renderPost(filtered.length ? filtered : posts);
      };



      handleClick()
      updateList()
      renderPost(posts)
    })
})