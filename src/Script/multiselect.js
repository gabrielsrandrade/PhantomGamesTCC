export function setupMultiselect(containerId) {
    const container = document.getElementById(containerId);
    const tagsDiv = container.querySelector(".multiselect-tags");
    const dropdown = container.querySelector(".multiselect-dropdown");
    let selectedValues = [];

    const renderTags = () => {
        tagsDiv.innerHTML = "";
        if (selectedValues.length === 0) {
            tagsDiv.textContent = "Clique para adicionar...";
            tagsDiv.classList.add("placeholder");
        } else {
            tagsDiv.classList.remove("placeholder");
            selectedValues.forEach((value) => {
                const tag = document.createElement("span");
                tag.classList.add("multiselect-tag");
                tag.textContent = value;
                const closeBtn = document.createElement("span");
                closeBtn.classList.add("tag-close");
                closeBtn.innerHTML = "&times;";
                closeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    selectedValues = selectedValues.filter((v) => v !== value);
                    renderTags();
                    updateDropdown();
                });
                tag.appendChild(closeBtn);
                tagsDiv.appendChild(tag);
            });
        }
    };

    const updateDropdown = () => {
        const options = dropdown.querySelectorAll(".multiselect-option");
        options.forEach((option) => {
            if (selectedValues.includes(option.dataset.value)) {
                option.classList.add("selected");
            } else {
                option.classList.remove("selected");
            }
        });
    };

    tagsDiv.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    dropdown.addEventListener("click", (e) => {
        const option = e.target.closest(".multiselect-option");
        if (!option || option.classList.contains("selected")) return;
        const value = option.dataset.value;
        if (!selectedValues.includes(value)) {
            selectedValues.push(value);
            renderTags();
            updateDropdown();
        }
        dropdown.classList.add("hidden");
    });

    const reset = () => {
        selectedValues = [];
        renderTags();
        updateDropdown();
    };

    const setValues = (values) => {
        selectedValues = [...values];
        renderTags();
        updateDropdown();
    };

    renderTags();
    updateDropdown();

    return {
        getValues: () => selectedValues,
        reset: reset,
        setValues: setValues,
    };
}