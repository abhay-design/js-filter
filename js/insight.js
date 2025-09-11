document.addEventListener('DOMContentLoaded', () => {
  fetch("insight.json")
    .then(responce => responce.json())
    .then(data => {
      const outers = document.querySelectorAll('.dropdown-outer .select-wrap');

      const handleClick = () => {
        outers.forEach(el => {
          el.addEventListener('click', function () {
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
      }

      handleClick()
      updateList()
    })
})