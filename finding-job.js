
window.minAutoLoadNewJobs = 1;
window.maxJobsListingCount = 50;

function searchTree(element, tag) {
	if (element.$vnode.tag.includes(tag)) {
		return element;
	} else if (element.$children != null) {
		let i;
		let result = null;
		for (i = 0; result == null && i < element.$children.length; i++) {
			result = searchTree(element.$children[i], tag);
		}
		return result;
	}
	return null;
}

let vueEl = searchTree(window.$nuxt.$children[0], 'FeedMy');
window.clearInterval(vueEl.newJobsPolling);
vueEl.newJobsPolling = setInterval((() => {
	document.querySelector("[data-test=job-tile-list]>section:first-of-type").style.borderTop = "6px dashed #108a0070"
	'8px dashed #108a0080';
	// if (this.newJobsCount >= window.minAutoLoadNewJobs) {
	// 	console.log("%c-- auto loading new jobs: " + this.newJobsCount, 'color: #0dcaf0');
	// 	document.querySelector("[data-test=newer-jobs-button]").click()
	// } else
	if (vueEl.newJobsCount > 0) {
		console.log(`%c[${new Date().toLocaleTimeString()}] updating new jobs count: ${vueEl.newJobsCount}`, 'color: #0dcaf0');
		vueEl.updateNewJobsCount(vueEl.currentTopic);
	} else {
		let job0 = window.$nuxt.$store._vm.$data.$$state.feedMy.jobs[0];
		console.log(`updating:  since_id = ${job0.recno},  job_ts = ${job0.jobTs}`);
	}
}), 15000);

document.querySelector("[data-test=announcements]").remove();
document.querySelector("[data-test=freelancer-tasks-section]").remove();

let styleSheet = document.createElement("style");
styleSheet.innerText = `
	[data-test=job-tile-list]>section{
		position: relative;
		background: #0000 !important;
	}
	[data-test=job-tile-list]>section .job-tile-title .up-n-link{
		color: #000;
    	text-decoration: underline;
	}
	[data-test=job-tile-list]>section.collapsed{
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
	}
	[data-test=job-tile-list]>section.collapsed .job-tile-badges *{
		display: none !important;
	}
	[data-test=job-tile-list]>section.collapsed>*:not(.row):not(.up-btn-z-toggle){
		display: none;
	}
	[data-test=job-tile-list]>section.collapsed>.row{
		margin: 0 !important;
	}
	[data-test=job-tile-list]>section.collapsed>.row .pr-15{
		display: none;
	}
	[data-test=job-tile-list]>section.collapsed>.row h3{
		font-size: .75rem;
	}
	[data-test=job-tile-list]>section .up-btn-z{
		--btn-circle-size: 3rem;
	    position: absolute;
	    font-size: 1.25rem;
		outline: none;
	}
	[data-test=job-tile-list]>section .up-btn-z-toggle{
		top: 1.5rem;
		right: -1.5rem;
	}
	[data-test=job-tile-list]>section .up-btn-z-toggle::before{
		content: "❌";
	}
	[data-test=job-tile-list]>section.collapsed .up-btn-z-toggle::before{
		content: "🤚";
	}
	[data-test=job-tile-list]>section.collapsed .up-btn-z-toggle{
		--btn-circle-size: 2rem;
		top: 0rem;
    	right: -1rem;
    	font-size: 1rem;
		outline: none;
	}
	[data-test=job-tile-list] .up-n-link:visited {
	    color: #0dcaf0 !important;
	}`;
document.head.appendChild(styleSheet);

window.zInterval && clearInterval(unsafeWindow.zInterval);
Array.from(document.querySelectorAll("[data-test=job-tile-list]>section.v-checked")).forEach(
	(el) => el.classList.remove('v-checked')
);
window.checkAll = function () {
	let newerJobsButton = document.querySelector("[data-test=newer-jobs-button]");
	if (newerJobsButton) {
		let newJobsCount = window.__NUXT__.state.feedMy.newJobsCount;
		var timeout = (parseInt(newerJobsButton.dataset.timeout) || 0) + 1;
		newerJobsButton.dataset.timeout = timeout;
		let timeoutMinites = Math.floor(timeout / 60);
		if (timeoutMinites < 10) timeoutMinites = "0" + timeoutMinites;
		let timeoutSeconds = timeout % 60;
		if (timeoutSeconds < 10) timeoutSeconds = "0" + timeoutSeconds;
		newerJobsButton.childNodes[1].textContent = `${newJobsCount} new job(s) ... [${timeoutMinites}:${timeoutSeconds}]`
		if (!newJobsCount.disabled && newJobsCount >= window.minAutoLoadNewJobs) {
			console.log(`%c[${new Date().toLocaleTimeString()}] auto loading new jobs: ${newJobsCount}`, 'color: #0dcaf0');
			newerJobsButton.click();
		}
	}

	let allSections = document.querySelectorAll("[data-test=job-tile-list]>section");
	if (allSections.length > window.maxJobsListingCount) {
		let deletecCount = 0;
		for (let i = window.maxJobsListingCount; i < allSections.length; i++) {
			allSections[i].remove();
			deletecCount++;
		}
		console.log(`${deletecCount} jobs removed.`);
	}

	let zList = document.querySelectorAll("[data-test=job-tile-list]>section:not(.v-checked)");
	let zListLength = zList.length;
	if (zListLength == 0) return;
	for (let i = 0; i < zListLength; i++) {
		let sectionElement = zList[i];

		sectionElement.querySelectorAll('.up-btn-z').forEach(e => e.remove());

		let buttonRecover = document.createElement("button");
		buttonRecover.className = "up-btn up-btn-circle up-btn-default up-btn-z"
		buttonRecover.style.cssText = "bottom: 2rem;right: 5.5rem;"
		buttonRecover.innerText = "☀";
		buttonRecover.title = "Recover transparency";
		buttonRecover.onclick = function (e) {
			e.stopPropagation();
			sectionElement.style.opacity = "1";
		}
		sectionElement.appendChild(buttonRecover);

		let buttonDismiss = document.createElement("button");
		buttonDismiss.className = "up-btn up-btn-circle up-btn-default up-btn-z"
		buttonDismiss.style.cssText = "bottom: 2rem;right: 2rem;"
		buttonDismiss.innerText = "🌙";
		buttonDismiss.title = "Make transparent";
		buttonDismiss.onclick = function (e) {
			e.stopPropagation();
			sectionElement.style.opacity = ".5";
		}
		sectionElement.appendChild(buttonDismiss);

		let buttonVisited = document.createElement("button");
		buttonVisited.className = "up-btn up-btn-circle up-btn-default up-btn-z"
		buttonVisited.style.cssText = "bottom: 2rem;right: -1.5rem;font-size: 1rem;"
		buttonVisited.innerText = "✔️";
		buttonVisited.title = "Add to browser history and make the link ':visited'";
		buttonVisited.onclick = function (e) {
			e.stopPropagation();
			var current_url = location.href;
			var desired_url = sectionElement.querySelector(".job-tile-title .up-n-link").href;
			history.replaceState({}, "", desired_url)
			history.replaceState({}, "", current_url)
		}
		sectionElement.appendChild(buttonVisited);

		let buttonToggle = document.createElement("button");
		buttonToggle.className = "up-btn up-btn-circle up-btn-default up-btn-z up-btn-z-toggle"
		buttonToggle.title = "Toggle collapse (Right click or click with CTRL to remove itself)";
		buttonToggle.onclick = function (e) {
			e.stopPropagation();
			if (e.ctrlKey) {
				sectionElement.remove();
			} else if (sectionElement.classList.contains("collapsed")) {
				sectionElement.classList.remove("collapsed");
			} else {
				sectionElement.classList.add("collapsed");
			}
		}
		buttonToggle.oncontextmenu = function (e) {
			e.preventDefault();
			sectionElement.remove();
		}
		sectionElement.appendChild(buttonToggle);

		let jobTitle = sectionElement.querySelector(".job-tile-title .up-n-link").innerText.toLowerCase();
		if (!jobTitle.includes("web") && (jobTitle.includes("android") || jobTitle.includes("iphone")))
			sectionElement.style.opacity = ".5";
		else if (jobTitle.startsWith("do not apply ") || jobTitle.startsWith("[$"))
			sectionElement.style.opacity = ".5";
		// else if (jobTitle.includes("tutor") || jobTitle.includes("assist") || jobTitle.includes("consult"))
		// 	sectionElement.style.opacity = ".5";

		let countryElementSmall = sectionElement.querySelector("[data-test=client-country]");
		let countryName = null;
		if (countryElementSmall) {
			let countryElementStrong = countryElementSmall.querySelector("strong");
			countryName = countryElementStrong.innerText;
		}
		if (!countryName) { }
		else if (countryName == "United States" || countryName == "Canada" || countryName == "Australia" || countryName == "Qutar")
			countryElementSmall.style.cssText = "color: #dc3545 !important;";
		else if (countryName == "India" || countryName == "Pakistan" || countryName == "Bangladesh" || countryName == "Nigeria" || countryName == "South Korea") {
			sectionElement.style.opacity = ".25";
			sectionElement.classList.add("collapsed");
		} else if (countryName == "Ukraine" || countryName == "Kazakhstan" || countryName == "Serbia")
			sectionElement.style.opacity = ".5";

		let budgetElement = sectionElement.querySelector("[data-test=job-type]");
		let budget = budgetElement.innerText.trim();
		let budgetMin = 0, budgetMax = 0;
		if (budget.split("$")[1]) budgetMin = parseInt(budget.split("$")[1]);
		if (budget.split("$")[2]) budgetMax = parseInt(budget.split("$")[2]);
		if (budgetMin && budgetMin < 10 && budgetMax && budgetMax < 15)
			sectionElement.style.opacity = ".5";
		else if (budgetMin && budgetMin >= 20 || budgetMin && budgetMax && budgetMin >= 15 && budgetMax >= 25)
			budgetElement.style.cssText = "color: #dc3545 !important;";
		else if (budget.startsWith("Hourly") && !budgetMin && !budgetMin && (countryName == "United States" || countryName == "Canada" || countryName == "Australia"))
			budgetElement.style.cssText = "color: #dc3545 !important;";

		sectionElement.classList.add("v-checked");
	}
	console.log(zListLength);
	return zListLength;
}
window.zInterval = setInterval(window.checkAll, 3000);

