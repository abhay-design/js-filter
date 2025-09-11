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
        // collect all data and remove ,
        const allAudiences = data.flatMap(item =>
          item.field_audience ? item.field_audience.split(",") : []
        );

        // trim spaces
        const trimmedAudiences = allAudiences.map(aud => aud.trim());

        //remove duplicacy
        const uniqueAudiences = [...new Set(trimmedAudiences)];

        //print audience data
        const audiencelist = document.querySelector("#audienceList");
        audiencelist.innerHTML = "";
        uniqueAudiences.forEach(type => {
          const li = document.createElement("li");
          const row = document.createElement("div");
          const wrap = document.createElement("div");
          const textwithnum = document.createElement("div");
          const span = document.createElement("span");
          const input = document.createElement("input");
          input.type = "checkbox";
          const label = document.createElement('label')
          var val = input.id = type;
          label.textContent = val;

          // li.textContent = type;
          row.classList.add("checkbox-row")
          wrap.classList.add("checkbox-wrap")
          textwithnum.classList.add("text-with-num")
          audiencelist.appendChild(li);

          li.appendChild(row)
          row.appendChild(wrap)
          wrap.appendChild(input)
          wrap.appendChild(label)
          row.appendChild(textwithnum)
          textwithnum.appendChild(span)
          span.textContent = type;
        });
      }

      handleClick()
      updateList()
    })
})