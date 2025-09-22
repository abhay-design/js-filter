document.addEventListener('DOMContentLoaded', () => {
  fetch("insight.json")
    .then(responce => responce.json())
    .then(data => {
      const outers = document.querySelectorAll('.dropdown-outer .select-wrap');
      const postcontainer = document.querySelector('.insights-filter .card-outer .wrapper');
      const cardouter = document.querySelector('.insights-filter .card-outer ')
      const paginationContainer = document.querySelector(".ajax-pagination");
      const posts = data;
      const search = document.querySelector(".search-outer input")
      const clerselection = document.querySelectorAll(".insights-filter .select-wrap .clear-selection")
      const selectedtag = document.querySelector(".insights-filter .selected-tags")
      const insightfilter = document.querySelector(".insights-filter");
      const btnwithtext = document.querySelector(".insights-filter .btn-with-text")
      const showingCalc = document.querySelector(".calc-result .showing-calc-result");
      const icons = document.querySelectorAll('.layout-wrap .layout-types .icon')


      let currentPage = 1;
      const postsPerPage = 21;
      // let filteredPosts = [];
      let filteredByFilters = posts;
      let filteredPosts = posts;

      // helper normalize fn
      const normalize = str => str.toLowerCase().trim().replace(/\s+/g, "-");

      // clicking funtion for the lists
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
          });
        });

        document.addEventListener("click", function (e) {
          const row = e.target.closest(".insights-filter .select-wrap .option-wrap .checkbox-row");
          if (row) {
            e.stopPropagation();
            const inpt = row.querySelector("input");

            if (inpt) {
              inpt.checked = !inpt.checked;

              if (!inpt.checked) {
                const existingTag = selectedtag.querySelector(`[data-filter-id="${inpt.id}"]`);
                if (existingTag) {
                  existingTag.remove();
                }

                if (!selectedtag.querySelector(".selected-val")) {
                  btnwithtext.innerHTML = "";
                }
              }
            }

            applyFilter();
          }
        });


        document.addEventListener('click', function (e) {
          if (!e.target.closest('.select-wrap')) {
            outers.forEach(o => {
              o.classList.remove('active');
              const opt = o.querySelector('.option-wrap');
              if (opt) opt.classList.remove('open');
            });
          }
        });
      };

      // added value from data into the list
      const updateList = (sourceData) => {

        const makeUniqueList = (arr) => [...new Set(arr.map(item => item.trim()).filter(Boolean))];

        // collect all data and remove ,
        const allAudiences = sourceData.flatMap(item =>
          item.field_audience ? item.field_audience.split(",") : []
        );
        const allProducts = sourceData.flatMap(item =>
          item.field_product ? item.field_product.split(",") : []
        );

        const contenttypes = [...new Set(sourceData.map(item => item["field_content_type"]))];

        const authortypes = [...new Set(
          sourceData.map(item => {
            if (!item.field_author) return null;
            const temp = document.createElement("div");
            temp.innerHTML = item.field_author;
            let text = temp.textContent.trim();
            return text.split(",")[0].trim();
          }).filter(Boolean)
        )];


        const uniqueAudiences = makeUniqueList(allAudiences);
        const uniqueProducts = makeUniqueList(allProducts);
        const uniqueContenttypes = makeUniqueList(contenttypes)
        const uniqueAuthors = makeUniqueList(authortypes);


        const buildList = (listContainer, items, key,) => {
          if (!listContainer) return;
          listContainer.innerHTML = "";
          items.forEach(type => {
            const safeId = normalize(type);

            let countNum = 0;
            sourceData.forEach(post => {
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
            input.setAttribute("data-count", countNum);

            if (countNum === 0) {
              input.disabled = true;
              console.log('here');
              li.classList.add('hidden')

            }

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
        buildList(document.querySelector("#authorList"), uniqueAuthors, "field_author");
      }

      // print all the cards
      const renderPost = (posts) => {
        filteredPosts = posts;
        const totalPosts = posts.length;

        if (!totalPosts) {
          postcontainer.innerHTML = `<p class="text-center text-gray-600">No posts found</p>`;
          paginationContainer.innerHTML = "";
          return;
        }
        // console.log(posts);

        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        const visiblePosts = posts.slice(start, end);

        if (showingCalc) {
          const from = start + 1;
          const to = Math.min(end, totalPosts);
          showingCalc.textContent = `Showing ${from}-${to} results of ${totalPosts}`;
        }


        postcontainer.innerHTML = visiblePosts.map(post => {
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
        renderPagination(totalPosts);
      }

      // for filter posts
      const applyFilter = () => {
        // Collect checked filters grouped by type
        const audienceChecked = Array.from(document.querySelectorAll("#audienceList input:checked")).map(i => i.id);
        const productChecked = Array.from(document.querySelectorAll("#productList input:checked")).map(i => i.id);
        const contentChecked = Array.from(document.querySelectorAll("#content-typeList input:checked")).map(i => i.id);
        const authorChecked = Array.from(document.querySelectorAll("#authorList input:checked")).map(i => i.id);

        let allChecked = [
          ...new Set([
            ...audienceChecked,
            ...productChecked,
            ...contentChecked,
            ...authorChecked
          ])
        ];


        if (allChecked.length > 0) {
          selectedtag.innerHTML = "";
          btnwithtext.innerHTML = "";

          allChecked.forEach(val => {
            const selectval = document.createElement("div");
            const typetag = document.createElement("span");
            const num = document.createElement("span");
            const removeBtn = document.createElement("button");

            selectval.classList.add("selected-val");
            typetag.classList.add("val");
            num.classList.add("num");
            removeBtn.className = "remove-filter cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-[#005677] text-darkGray text-[28px] transition-all duration-300 ease-in-out";


            selectval.dataset.filterId = val;

            removeBtn.textContent = "×";

            const inputAtCreate = document.getElementById(val);
            if (inputAtCreate) {
              typetag.textContent = inputAtCreate.nextElementSibling?.textContent || val;
              num.textContent = `(${inputAtCreate.getAttribute("data-count") || 0})`;
            } else {
              typetag.textContent = val;
              num.textContent = "";
            }

            const clearFilter = function (e) {
              e.stopPropagation();
              const id = this.dataset.filterId;
              const inputEl = document.getElementById(id);
              if (inputEl) inputEl.checked = false;

              // remove the tag
              this.remove();

              // if none left, hide clear-all UI
              if (!selectedtag.querySelector('.selected-val')) {
                btnwithtext.innerHTML = "";
              }

              // defer applyFilter to the next tick to avoid event/DOM race conditions
              setTimeout(() => applyFilter(), 0);
            };

            // clicking the whole pill clears the filter
            selectval.addEventListener("click", clearFilter);

            // clicking the × also clears (stop propagation so only our handler runs)
            removeBtn.addEventListener("click", function (e) {
              e.stopPropagation();
              clearFilter.call(selectval, e);
            });

            selectval.appendChild(typetag);
            selectval.appendChild(num);
            selectval.appendChild(removeBtn);
            selectedtag.appendChild(selectval);
          });

          const clearall = document.createElement("span");
          clearall.classList.add("clear-selection");
          clearall.textContent = "Clear selection";

          clearall.addEventListener("click", () => {
            document.querySelectorAll(".checkbox-row input:checked").forEach(cb => cb.checked = false);
            selectedtag.innerHTML = "";
            btnwithtext.innerHTML = "";
            applyFilter();
          });

          btnwithtext.appendChild(clearall);
        }


        let filtered = posts.filter(post => {
          let keep = true;

          // Audience filter (OR logic)
          if (audienceChecked.length) {
            const values = (post.field_audience || "").split(",").map(v => normalize(v));
            keep = audienceChecked.some(id => values.includes(id));
          }


          // Product filter (AND with audience if both chosen)
          if (keep && productChecked.length) {
            const values = (post.field_product || "").split(",").map(v => normalize(v));
            keep = productChecked.some(id => values.includes(id));
          }

          // Content type filter
          if (keep && contentChecked.length) {
            const value = normalize(post.field_content_type || "");
            keep = contentChecked.includes(value);
          }


          // Author filter
          if (keep && authorChecked.length) {
            const temp = document.createElement("div");
            temp.innerHTML = post.field_author || "";
            const authorText = temp.textContent.trim().split(",")[0];
            const value = normalize(authorText);
            keep = authorChecked.includes(value);
          }

          return keep;
        });

        console.log(filtered);

        updateList(filtered);

        allChecked.forEach(id => {
          const inputEl = document.getElementById(id);
          if (inputEl) inputEl.checked = true;
        });

        currentPage = 1;
        renderPost(filtered);
        filteredByFilters = filtered;
        applySearch();
      };

      // for pagination code
      const renderPagination = (totalPosts) => {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        if (totalPages <= 1) return;

        // Helper to create button
        const createBtn = (label, page, disabled = false, active = false) => {
          const btn = document.createElement("button");
          btn.textContent = label;
          btn.className = `px-4 py-2 rounded-md border mx-1 ${active
            ? "bg-[#005677] text-white"
            : disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-black"
            }`;
          btn.disabled = disabled;
          if (!disabled && !active) {
            btn.addEventListener("click", () => {
              currentPage = page;
              renderPost(filteredPosts);

              insightfilter.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            });
          }
          return btn;
        };

        // Prev button
        paginationContainer.appendChild(
          createBtn("Prev", currentPage - 1, currentPage === 1)
        );

        // Page numbers with ellipsis
        const maxVisible = 1; // how many numbers to show around current page
        const pages = [];

        if (totalPages <= maxVisible + 2) {
          // show all if few pages
          for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1); // always show first page

          let start = Math.max(2, currentPage - 2);
          let end = Math.min(totalPages - 1, currentPage + 2);

          if (start > 2) pages.push("...");
          for (let i = start; i <= end; i++) pages.push(i);
          if (end < totalPages - 1) pages.push("...");

          pages.push(totalPages); // always show last page
        }

        pages.forEach((p) => {
          if (p === "...") {
            const span = document.createElement("span");
            span.textContent = "...";
            span.className = "px-3";
            paginationContainer.appendChild(span);
          } else {
            paginationContainer.appendChild(createBtn(p, p, false, p === currentPage));
          }
        });

        // Next button
        paginationContainer.appendChild(
          createBtn("Next", currentPage + 1, currentPage === totalPages)
        );
      };

      // for search function
      const applySearch = () => {
        const query = search.value.toLowerCase().trim();

        let filtered = filteredByFilters.filter(post => {
          let title = post.title ? post.title.toLowerCase() : "";
          let author = "";
          if (post.field_author) {
            const temp = document.createElement("div");
            temp.innerHTML = post.field_author;
            author = temp.textContent.toLowerCase();
          } else if (post.guest_author) {
            author = post.guest_author.toLowerCase();
          }

          let contentType = post.field_content_type ? post.field_content_type.toLowerCase() : "";

          return (
            title.includes(query) ||
            author.includes(query) ||
            contentType.includes(query)
          );
        });

        currentPage = 1;
        filteredPosts = filtered;
        renderPost(filteredPosts);
      };

      // for clearing list
      const Clearslection = () => {
        clerselection.forEach(btn => {
          btn.addEventListener("click", function (e) {
            e.stopPropagation();

            const parent = this.closest(".select-wrap");

            const inputs = parent.querySelectorAll("input[type='checkbox']");
            inputs.forEach(input => (input.checked = false));

            selectedtag.innerHTML = "";
            btnwithtext.innerHTML = "";

            applyFilter();
          });
        });
      }

      const Cardshape = () => {
        if (icons.length > 0) {
          icons[0].classList.add('active');
        }
        icons.forEach(icon => {
          icon.addEventListener('click', function (e) {
            icons.forEach(el => el.classList.remove('active'));
            icon.classList.add('active')

            setTimeout(() => {
              if (icons[1] && icons[1].classList.contains('active')) {
                cardouter.classList.add('list-view');
              } else {
                cardouter.classList.remove('list-view');
              }

              cardouter.classList.remove('opacity-0');
            }, 100);
          })
        })
      }


      handleClick()
      updateList(posts);
      // applySearch();
      renderPost(posts)
      Clearslection()
      Cardshape()
      search.addEventListener("input", applySearch);
    })
})