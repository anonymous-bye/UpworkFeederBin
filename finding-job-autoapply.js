// https://www.upwork.com/nx/find-work/sw.js
// window.$nuxt.$store._vm.$data.$$state['feedMy']['jobs'][0].recno

window.SERVER_URL = "http://web.valloon.me";

window.AUTO_ENABLED = 1;
window.PRE = [1, 2];

window.CHANNELS = [2, 3];
window.CHANNEL_INDEX = 0;
window.AUTO_INTERVAL = 5000;

function getNextChannel() {
	let channel = window.CHANNELS[window.CHANNEL_INDEX];
	window.CHANNEL_INDEX = (window.CHANNEL_INDEX + 1) % window.CHANNELS.length;
	return channel;
}

function resetAuto() {
	Array.from(document.querySelectorAll("[data-test=job-tile-list]>section")).forEach(
		(el) => el.classList.remove('v-checked-autoapply')
	);
}

window.setTimeout(async () => {
	if (document.querySelectorAll("[data-test=job-tile-list]").length) {
		(function () {
			let styleSheet = document.createElement("style");
			styleSheet.innerText = `
[data-test=job-tile-list]>section .up-label-auto{
	display: inline-block;
	margin-top: 0.25rem;
	margin-right: 0.5rem;
	padding: 0.125rem 0.75rem 0.125rem 0.5rem;
	color: #fff;
	background: #0093ff;
	font-size: .75rem;
	vertical-align: top;
	white-space: nowrap;
	border: none;
	border-radius: 1rem;
}
[data-test=job-tile-list]>section .up-label-auto.up-label-auto-outline{
	color: #00adff;
	background: none;
	outline: 1px solid #00adff;
	outline-offset: -1px;
}
[data-test=job-tile-list]>section .up-btn-z-auto{
	margin: 0 0 0 1.5rem;
	width: 4rem;
	height: 1.25rem;
	font-size: .625rem;
	vertical-align: middle;
	color: #ff00dd;
	opacity: .7;
	outline: none;
}
[data-test=job-tile-list]>section .up-btn-z-auto:hover{
	color: #dc3545;
	opacity: 1;
}
[data-test=job-tile-list]>section.collapsed .up-btn-z-auto{
	display: none;
}`;
			document.head.appendChild(styleSheet);
		})();

		// Array.from(document.querySelectorAll("[data-test=job-tile-list]>section")).forEach(
		// 	(el) => el.classList.add('v-checked-autoapply')
		// );
		Array.from(document.querySelectorAll("[data-test=job-tile-list]>section.v-checked-autobtn")).forEach(
			(el) => el.classList.remove('v-checked-autobtn')
		);
		if (window["last_t"])
			window[window["last_t"]] = false;
		let t = new Date().getTime();
		window["last_t"] = t;
		window[t] = t;
		while (window[t]) {
			{
				let sections = document.querySelectorAll("[data-test=job-tile-list]>section:not(.v-checked-autobtn)");
				let sectionsCount = sections.length;
				for (let i = 0; i < sectionsCount; i++) {
					let sectionElement = sections[i];
					sectionElement.querySelectorAll('.up-btn-z-auto').forEach(e => e.remove());

					let buttonAuto = document.createElement("button");
					buttonAuto.className = "up-btn up-btn-default up-btn-z-auto"
					buttonAuto.style.cssText = ""
					buttonAuto.innerText = "AUTO";
					buttonAuto.onclick = async function (e) {
						e.stopPropagation();

						let countryElementSmall = sectionElement.querySelector("[data-test=client-country]");
						let countryName = null;
						if (countryElementSmall) {
							let countryElementStrong = countryElementSmall.querySelector("strong");
							countryName = countryElementStrong.innerText;
						}

						const jobTitle = sectionElement.querySelector(".job-tile-title .up-n-link").innerText.trim();
						const jobDescription = sectionElement.querySelector("[data-test=job-description-text]").innerText
						const jobUrl = sectionElement.querySelector(".job-tile-title .up-n-link").href;
						let startIndex = jobUrl.indexOf("~");
						if (startIndex == -1) console.error("jobId not found: " + jobUrl);
						let endIndex = jobUrl.indexOf("/", startIndex);
						const jobId = endIndex == -1 ? jobUrl.substring(startIndex) : jobUrl.substring(startIndex, endIndex);

						let proposalTypes = window.getProposalTypes(jobTitle, jobDescription, false);
						let proposalTypeInput = "";
						if (proposalTypes && proposalTypes.length)
							proposalTypeInput = `${proposalTypes[0].title}`;
						while (true) {
							proposalTypeInput = prompt("", proposalTypeInput);
							if (!proposalTypeInput) return;
							proposalTypes = window.getProposalTypes(proposalTypeInput.split("/")[0], false, false);
							if (proposalTypes && proposalTypes.length) break;
						}
						try {
							const summaryResponse = await fetch(`/job-details/jobdetails/api/job/${jobId}/summary`, {
								headers: {
									"x-requested-with": "XMLHttpRequest",
								},
							});
							if (summaryResponse.status == 403 || summaryResponse.status == 404) {
								const labelAuto = document.createElement("label");
								labelAuto.className = "up-label-auto up-label-auto-outline";
								// labelAuto.style.cssText = "";
								labelAuto.innerText = `${summaryResponse.status}`;
								sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
								return;
							}
							const summaryData = await summaryResponse.json();
							const countryFromSummary = summaryData.buyer.location.country;
							const questionCount = summaryData.job.questions.length;
							if (window.checkCountryBan(countryFromSummary) && !confirm(`${countryFromSummary}: Banned country, Continue?`)) {
							} else if (questionCount) {
								const labelAuto = document.createElement("label");
								labelAuto.className = "up-label-auto up-label-auto-outline";
								// labelAuto.style.cssText = "";
								labelAuto.innerText = `❓ +${questionCount} questions`;
								sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
							} else {
								let preference = parseInt(proposalTypeInput.split("/")[1]) || 0;
								let channel = getNextChannel();
								for (let i = 0; i < proposalTypes.length; i++) {
									const proposalType = proposalTypes[i];
									if (!preference || preference == proposalType.preference) {
										await submitProposal(jobId, countryName, proposalType.profile, proposalType.proposalId, undefined, jobTitle, countryFromSummary, proposalType.priority, proposalType.channel || channel, 0, (labelAuto) => {
											sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
										});
									}
								}
							}
							// buttonAuto.remove();
						} catch (error) {
							console.log(error);
						}
						// buttonAuto.innerText = "...";
						// buttonAuto.disabled = true;
					}
					sectionElement.querySelector(".job-tile-title").appendChild(buttonAuto);
					sectionElement.classList.add("v-checked-autobtn");
				}
			}
			if (window.AUTO_ENABLED) {
				let sections = document.querySelectorAll("[data-test=job-tile-list]>section:not(.v-checked-autoapply)");
				let sectionsCount = sections.length;
				let sectionsCheckedCount = 0;
				sections.forEach(
					(el) => el.classList.add('v-checked-autoapply')
				);
				for (let i = 0; i < sectionsCount; i++) {
					try {
						let sectionElement = sections[i];
						sectionsCheckedCount++;

						let countryElementSmall = sectionElement.querySelector("[data-test=client-country]");
						let countryName = null;
						if (countryElementSmall) {
							let countryElementStrong = countryElementSmall.querySelector("strong");
							countryName = countryElementStrong.innerText;
						}
						if (window.checkCountryBan(countryName))
							continue;
						let budgetElement = sectionElement.querySelector("[data-test=job-type]");
						let budget = budgetElement.innerText.trim().replaceAll(/,/g, '');
						if (budget.includes("Fixed"))
							budget = budgetElement.parentElement.innerText.trim().replaceAll(/,/g, '');
						let budgetMin = 0, budgetMax = 0;
						if (budget.split("$")[1]) budgetMin = parseInt(budget.split("$")[1]);
						if (budget.split("$")[2]) budgetMax = parseInt(budget.split("$")[2]);
						if (budgetMin && budgetMin < 10 && !budgetMax || budgetMax && budgetMax < 15)
							continue;
						if (budget.includes("Fixed") && budgetMin && budgetMin < 500)
							continue;

						const jobTitle = sectionElement.querySelector(".job-tile-title .up-n-link").innerText.trim();
						const jobDescription = sectionElement.querySelector("[data-test=job-description-text]").innerText
						const jobUrl = sectionElement.querySelector(".job-tile-title .up-n-link").href;
						let startIndex = jobUrl.indexOf("~");
						if (startIndex == -1) console.error("jobId not found: " + jobUrl);
						let endIndex = jobUrl.indexOf("/", startIndex);
						const jobId = endIndex == -1 ? jobUrl.substring(startIndex) : jobUrl.substring(startIndex, endIndex);
						const proposalTypes = window.getProposalTypes(jobTitle, jobDescription, true);
						if (proposalTypes && proposalTypes.length) {
							const summaryResponse = await fetch(`/job-details/jobdetails/api/job/${jobId}/summary`, {
								headers: {
									"x-requested-with": "XMLHttpRequest",
								},
							});
							if (summaryResponse.status == 403 || summaryResponse.status == 404) {
								const labelAuto = document.createElement("label");
								labelAuto.className = "up-label-auto up-label-auto-outline";
								// labelAuto.style.cssText = "";
								labelAuto.innerText = `${summaryResponse.status}`;
								sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
								continue;
							}
							const summaryData = await summaryResponse.json();
							const countryFromSummary = summaryData.buyer.location.country;
							const questionCount = summaryData.job.questions.length;
							if (window.checkCountryBan(countryFromSummary)) {
								const labelAuto = document.createElement("label");
								labelAuto.className = "up-label-auto up-label-auto-outline";
								// labelAuto.style.cssText = "";
								labelAuto.innerText = `${countryFromSummary}`;
								sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
							} else if (questionCount) {
								const labelAuto = document.createElement("label");
								labelAuto.className = "up-label-auto up-label-auto-outline";
								// labelAuto.style.cssText = "";
								labelAuto.innerText = `❓ +${questionCount} questions`;
								sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
							} else {
								let channel = getNextChannel();
								for (let i = 0; i < proposalTypes.length; i++) {
									const proposalType = proposalTypes[i];
									if (window.PRE.includes(proposalType.preference)) {
										await submitProposal(jobId, countryName, proposalType.profile, proposalType.proposalId, undefined, jobTitle, countryFromSummary, proposalType.priority, proposalType.channel || channel, 1, (labelAuto) => {
											sectionElement.querySelector(".job-tile-title").parentElement.appendChild(labelAuto);
										});
									}
								}
							}
						}
					} catch (error) {
						console.warn(error);
					}
				}
				if (sectionsCheckedCount > 0 || sectionsCount > 0)
					console.log(`auto checked: ${sectionsCheckedCount} / ${sectionsCount}`);
			}
			await new Promise(resolve => setTimeout(resolve, 3000));
		}
		console.log("End last loop: " + new Date(t).toLocaleString());
	} else {
		if (window["last_t"])
			window[window["last_t"]] = false;
		let t = new Date().getTime();
		window["last_t"] = t;
		window[t] = t;

		window.since_id = window.since_id || 0;
		window.job_ts = window.job_ts || 0;

		while (window[t]) {
			try {
				const response0 = await fetch(`https://www.upwork.com/ab/find-work/api/feeds/saved-searches?since_id=${window.since_id}&job_ts=${window.job_ts}&paging=0%3B0`, {
					"headers": {
						"x-odesk-user-agent": "oDesk LM",
						"x-requested-with": "XMLHttpRequest",
						"x-upwork-accept-language": "en-US"
					},
					"method": "GET",
					"mode": "cors",
					"credentials": "include"
				});
				if (response0.status == 401) {
					console.log(`[${new Date().toLocaleTimeString()}]  Opening upwork page for 401 Error...`);
					let newTab = window.open('https://www.upwork.com/nx/find-work/', '_blank');
					await new Promise(resolve => setTimeout(resolve, window.AUTO_INTERVAL));
					newTab && newTab.close();
					continue;
				}
				if (!response0.ok)
					throw new Error(`Bad response0: ${response0.status}`);
				const data0 = await response0.json();
				if (!window.job_ts) {
					if (data0.paging && data0.paging.resultSetTs) {
						window.job_ts = data0.paging.resultSetTs;
						console.log(`[${new Date().toLocaleTimeString()}]  job_ts = ${window.job_ts}`);
					}
				} else if (data0.paging && data0.paging.total) {
					console.log(`pagingTotal = ${data0.paging.total},  since_id = ${window.since_id},  job_ts = ${window.job_ts}`);
					for (let i = tryCount = 0; tryCount < 10; tryCount++) {
						await new Promise(resolve => setTimeout(resolve, 1000));
						const response20 = await fetch(`https://www.upwork.com/ab/find-work/api/feeds/saved-searches?since_id=${window.since_id}&job_ts=${window.job_ts}&paging=0%3B50`, {
							"headers": {
								"x-odesk-user-agent": "oDesk LM",
								"x-requested-with": "XMLHttpRequest",
								"x-upwork-accept-language": "en-US"
							},
							"method": "GET",
							"mode": "cors",
							"credentials": "include"
						});
						if (!response20.ok)
							throw new Error(`Bad response20: ${response20.status}`);
						const data20 = await response20.json();
						let resultsCount = data20.results.length;
						if (resultsCount > 0) {
							window.job_ts = data20.paging.resultSetTs || window.job_ts;
							if (data20.results[0].recno)
								window.since_id = data20.results[0].recno;
							for (let i = 0; i < resultsCount; i++) {
								const el = data20.results[i];
								const countryName = el.client.location.country;
								if (window.checkCountryBan(countryName))
									continue;
								if (el.hourlyBudget.min && el.hourlyBudget.min < 10 && !el.hourlyBudget.max || el.hourlyBudget.max && el.hourlyBudget.max < 15)
									continue;
								if (el.amount.amount && el.amount.amount < 500)
									continue;
								const jobTitle = el.title;
								const jobDescription = el.description;
								const jobId = el.ciphertext;
								const proposalTypes = window.getProposalTypes(jobTitle, jobDescription, true);
								if (proposalTypes && proposalTypes.length) {
									const summaryResponse = await fetch(`/job-details/jobdetails/api/job/${jobId}/summary`, {
										headers: {
											"x-requested-with": "XMLHttpRequest",
										},
									});
									if (summaryResponse.status == 403 || summaryResponse.status == 404) continue;
									const summaryData = await summaryResponse.json();
									const countryFromSummary = summaryData.buyer.location.country;
									const questionCount = summaryData.job.questions.length;
									if (window.checkCountryBan(countryFromSummary)) {
										console.log(`[${new Date().toLocaleTimeString()}]  ${jobId} / ${countryFromSummary} / ${jobTitle}`);
									} else if (questionCount) {
										console.log(`[${new Date().toLocaleTimeString()}]  ${jobId} / +${questionCount} questions / ${jobTitle}`);
									} else {
										let channel = getNextChannel();
										for (let i = 0; i < proposalTypes.length; i++) {
											const proposalType = proposalTypes[i];
											await submitProposal(jobId, countryName, proposalType.profile, proposalType.proposalId, undefined, jobTitle, countryFromSummary, proposalType.priority, proposalType.channel || channel, 1);
										}
									}
								}
							}
							break;
						} else {
							console.log(`resultsCount = ${resultsCount}, try = ${++tryCount}`)
						}
					}
				} else {
					console.log(`pagingTotal = ${data0.paging.total},  since_id = ${window.since_id},  job_ts = ${window.job_ts}`);
				}
			} catch (error) {
				console.warn('Error:', error);
			}
			await new Promise(resolve => setTimeout(resolve, window.AUTO_INTERVAL));
		}
		console.log("End last loop: " + new Date(t).toLocaleString());
	}
}, window.AUTO_INTERVAL);

window.checkCountryBan = function (countryName) {
	if (!countryName) return false;
	if (countryName == "United States" || countryName == "Canada" || countryName == "Australia" || countryName == "Qutar" || countryName == "Brazil") return false;
	if (countryName == "United Kingdom" || countryName == "France" || countryName == "Switzerland" || countryName == "Sweden" || countryName == "United Arab Emirates") return false;
	if (countryName == "India" || countryName == "Pakistan" || countryName == "Bangladesh" || countryName == "Nigeria" || countryName == "South Korea"
		|| countryName == "Ukraine" || countryName == "Kazakhstan" || countryName == "Serbia")
		return true;
	// return true;
}

window.checkTitleBan = function (jobTitleLowerCase) {
	if (jobTitleLowerCase.startsWith("do not apply ") || jobTitleLowerCase.startsWith("[$"))
		return jobTitleLowerCase;
	const banList = [/* " tutor", " teach", " guide", " assist", " consult", " support", " lead", "troubleshoot",*/
		" android ", " iphone ", " ionic ", " unity ", " unreal ", " swift ", " ios ", " react native ", " reactnative ", " flutter ",
		" zoho ", " youtube ", " tiktok ", " reddit ", " spotify ", " facebook ", " linkedin ", " twitter ", " instagram ", " pinterest ", " whatsapp ", /*" social",*/ " dating ",
		" airtable ", " notion ", " salesforce ", " squarespace ", " zenddesk ", " hubspot ",
		" filemaker ", " sharepoint ", " moodle ", " odoo ", " kajabi ", " thinkific ",
		" drupal ", " graphic design", " graphite design", "webassembly", "web assembly",
		" devops ", " dev ops ", " kubernetes ", " voip ", " streaming ", " mulesoft ", " gsap ",
		" tradingview ", " pinescript ", " metatrader ", " mt4 ", " mt5 ",
		" framer ", " terraform ", " quickbooks ", " monday.com ", " playwright ",
		" cheap ", " low budget ", " budget is low ",
		/*" power automate ", " zapier ", " make.com ",*/ " podio ", " wix ", " bubble.io ", " unbounce ", " xano "];
	for (var i in banList)
		if (` ${jobTitleLowerCase} `.includes(banList[i])) return banList[i];
	return false;
}

window.getProposalTypes = function (jobTitle, jobDescription, checkBan) {
	if (!jobTitle) {
		console.log("jobTitle is null.");
		return;
	}
	jobTitle = jobTitle.replaceAll(/[\,\/\-\~\!\?–]/g, " ").replace(/\.+$/, "").replaceAll(/\s\s+/g, " ").toLowerCase();
	if (checkBan && checkTitleBan(jobTitle)) return;
	if (jobTitle.includes("webflow"))
		return [
			{ preference: 1, title: "webflow", profile: "webflow-2", proposalId: "webflow-8", channel: 0, priority: 3 },
			{ preference: 2, title: "webflow", profile: "webflow", proposalId: "webflow-7", channel: 0, priority: 2 },
		];
	if (jobTitle.includes("shopify"))
		return [
			{ preference: 1, title: "shopify", profile: "ecommerce", proposalId: "shopify-8", channel: 0, priority: 3 },
			{ preference: 2, title: "shopify", profile: "shopify", proposalId: "shopify-7", channel: 0, priority: 2 },
		];
	if (jobTitle.includes("wordpress") || jobTitle.includes("word press") || jobTitle.includes("woocommerce") || ` ${jobTitle} `.includes(" divi ") || jobTitle.includes("elementor"))
		return [
			{ preference: 1, title: "wordpress", profile: "laravel-ruby", proposalId: "wordpress-2", channel: 0, priority: 3 },
			{ preference: 2, title: "wordpress", profile: "wp-django", proposalId: "wordpress-1", channel: 0, priority: 2 },
		];
	if (jobTitle.includes("laravel") || jobTitle.includes("php") || jobTitle.includes("codeigniter") || jobTitle.includes("cpanel"))
		return [
			{ preference: 1, title: "laravel", profile: "wp-django", proposalId: "laravel-2", channel: 0, priority: 5 },
			{ preference: 2, title: "laravel", profile: "laravel-ruby", proposalId: "laravel-1", channel: 0, priority: 4 },
		];
	if (jobTitle.includes("commerce"))
		return [
			{ preference: 1, title: "ecommerce", profile: "shopify", proposalId: "ecommerce-8", channel: 0, priority: 2 },
			{ preference: 2, title: "ecommerce", profile: "ecommerce", proposalId: "ecommerce-7", channel: 0, priority: 1 },
		];
	if (jobTitle.includes("web3") || jobTitle.includes("web 3") || jobTitle.includes("blockchain") || jobTitle.includes("solidity")
		|| jobTitle.includes("ethereum") || jobTitle.includes("polygon") || jobTitle.includes("rust") || jobTitle.includes("nft")
		|| jobTitle.includes("smartcontract") || jobTitle.includes("smart contract")
		|| jobTitle.includes("wallet") && (jobTitle.includes("crypto") || jobTitle.includes("connect")))
		return [
			{ preference: 1, title: "web3 / blockchain", profile: "blockchain-2", proposalId: "blockchain-5", channel: 0, priority: 2 },
			{ preference: 2, title: "web3 / blockchain", profile: "blockchain", proposalId: "blockchain-4", channel: 0, priority: 1 },
		];
	if (jobTitle.includes("django") || jobTitle.includes("flask"))
		return [
			{ preference: 1, title: "django", profile: "wp-django", proposalId: "django-flask-1", channel: 0, priority: 1 }
		];
	if (` ${jobTitle} `.includes(" ruby ") || ` ${jobTitle} `.includes(" rails "))
		return [
			{ preference: 1, title: "ruby on rails", profile: "laravel-ruby", proposalId: "ruby-1", channel: 0, priority: 1 }
		];
	if (` ${jobTitle} `.includes(" spring ") || jobTitle.includes("java") && (jobTitle.includes("web") || jobTitle.includes("backend") || jobTitle.includes("back end") || jobTitle.includes("fullstack") || jobTitle.includes("full stack")))
		return [
			{ preference: 1, title: "java spring", profile: "java-cs", proposalId: "java-spring-1", channel: 0, priority: 1 }
		];
	if (jobTitle.includes("asp.net"))
		return [
			{ preference: 1, title: "asp.net", profile: "java-cs", proposalId: "asp-1", channel: 0, priority: 1 }
		];
	if (jobTitle.includes("react") || jobTitle.includes("next") || jobTitle.includes("gatsby") || ` ${jobTitle} `.includes(" mern "))
		return [
			{ preference: 1, title: "react", profile: "node-php", proposalId: "react-5", channel: 0, priority: 4 },
			{ preference: 2, title: "react", profile: "javascript", proposalId: "react-4", channel: 0, priority: 3 },
		];
	if (jobTitle.includes("vue") || jobTitle.includes("nuxt") || jobTitle.includes("mevn"))
		return [
			{ preference: 1, title: "vue", profile: "node-php", proposalId: "vue-5", channel: 0, priority: 4 },
			{ preference: 2, title: "vue", profile: "javascript", proposalId: "vue-4", channel: 0, priority: 3 },
		];
	if (jobTitle.includes("svelte"))
		return [
			{ preference: 1, title: "svelte", profile: "node-php", proposalId: "svelte-5", channel: 0, priority: 3 },
			{ preference: 2, title: "svelte", profile: "javascript", proposalId: "svelte-4", channel: 0, priority: 2 },
		];
	if (` ${jobTitle} `.includes(" node") || ` ${jobTitle} `.includes(" express") || ` ${jobTitle} `.includes(" nest") || jobTitle.includes("typescript"))
		return [
			{ preference: 1, title: "node", profile: "node-php", proposalId: "node-5", channel: 0, priority: 4 },
			{ preference: 2, title: "node", profile: "javascript", proposalId: "node-4", channel: 0, priority: 3 },
		];
	if (jobTitle.includes("chrome") && jobTitle.includes("extension"))
		return [
			{ preference: 1, title: "chrome extension", profile: "frontend", proposalId: "chrome-extension-7", channel: 0, priority: 2 },
		];
	if (jobTitle.includes("frontend") || jobTitle.includes("front end") || jobTitle.includes("responsive") || ` ${jobTitle} `.includes(" css ") || jobTitle.includes("figma to html"))
		return [
			{ preference: 1, title: "frontend", profile: "frontend-2", proposalId: "frontend-8", channel: 0, priority: 2 },
			{ preference: 2, title: "frontend", profile: "frontend", proposalId: "frontend-7", channel: 0, priority: 1 },
		];
	if (jobTitle.includes("scraping") || jobTitle.includes("crawling"))
		return [
			{ preference: 2, title: "scraping", profile: "automation", proposalId: "scraping-9", channel: 0, priority: 1 }
		];
	if ((jobTitle.includes("automat") || jobTitle.includes("bot dev")) && !jobTitle.includes("trading") && !jobTitle.includes("strateg")
		|| jobTitle.includes("power automate") || jobTitle.includes("zapier") || jobTitle.includes("make.com"))
		return [
			{ preference: 1, title: "automation", profile: "automation", proposalId: "automation-9", channel: 0, priority: 3 },
			{ preference: 2, title: "automation", profile: "basic", proposalId: "bot-auto-9", channel: 0, priority: 2 },
		];
	if (` ${jobTitle} `.includes(" web ") || ` ${jobTitle} `.includes(" site ") || jobTitle.includes("webpage") || jobTitle.includes("website")
		|| jobTitle.includes("dashboard") || jobTitle.includes("landing") || jobTitle.includes("portal") ||
		jobTitle.includes("backend") || jobTitle.includes("back end") || jobTitle.includes("fullstack") || jobTitle.includes("full stack")) {
		if (jobDescription) {
			jobDescription = jobDescription.replaceAll(/[\,\/\-\~\!\?–]/g, " ").replace(/\.+$/, "").replaceAll(/\s\s+/g, " ").toLowerCase();
			if (jobDescription.includes("webflow"))
				return [
					{ preference: 1, title: "webflow", profile: "webflow-2", proposalId: "webflow-8", channel: 0, priority: 3 },
					{ preference: 2, title: "webflow", profile: "webflow", proposalId: "webflow-7", channel: 0, priority: 2 },
				];
			if (jobDescription.includes("shopify"))
				return [
					{ preference: 1, title: "shopify", profile: "ecommerce", proposalId: "shopify-8", channel: 0, priority: 3 },
					{ preference: 2, title: "shopify", profile: "shopify", proposalId: "shopify-7", channel: 0, priority: 2 },
				];
			if (jobDescription.includes("web3") || jobDescription.includes("web 3") || jobDescription.includes("blockchain") || jobDescription.includes("solidity")
				|| jobDescription.includes("ethereum") || jobDescription.includes("polygon") || ` ${jobDescription} `.includes(" rust ") || ` ${jobDescription} `.includes(" nft ")
				|| jobDescription.includes("smartcontract") || jobDescription.includes("smart contract")
				|| jobDescription.includes("wallet") && (jobDescription.includes("crypto") || jobDescription.includes("connect")))
				return [
					{ preference: 1, title: "web3 / blockchain", profile: "blockchain-2", proposalId: "blockchain-5", channel: 0, priority: 2 },
					{ preference: 2, title: "web3 / blockchain", profile: "blockchain", proposalId: "blockchain-4", channel: 0, priority: 1 },
				];
			if (jobDescription.includes("laravel") || jobDescription.includes("php") || jobDescription.includes("codeigniter") || jobDescription.includes("cpanel"))
				return [
					{ preference: 1, title: "laravel", profile: "wp-django", proposalId: "laravel-2", channel: 0, priority: 4 },
					{ preference: 2, title: "laravel", profile: "laravel-ruby", proposalId: "laravel-1", channel: 0, priority: 3 },
				];
			if (jobDescription.includes("wordpress") || jobDescription.includes("woocommerce") || jobDescription.includes("divi ") || jobDescription.includes("elementor"))
				return [
					{ preference: 1, title: "wordpress", profile: "laravel-ruby", proposalId: "wordpress-2", channel: 0, priority: 3 },
					{ preference: 2, title: "wordpress", profile: "wp-django", proposalId: "wordpress-1", channel: 0, priority: 2 },
				];
			if (jobDescription.includes("django") || jobDescription.includes("flask"))
				return [
					{ preference: 1, title: "django", profile: "wp-django", proposalId: "django-flask-1", channel: 0, priority: 1 }
				];
			if (` ${jobDescription} `.includes(" ruby ") || ` ${jobDescription} `.includes(" rales "))
				return [
					{ preference: 1, title: "ruby on rails", profile: "laravel-ruby", proposalId: "ruby-1", channel: 0, priority: 1 }
				];
			if (` ${jobDescription} `.includes(" java ") || ` ${jobDescription} `.includes(" spring "))
				return [
					{ preference: 1, title: "java spring boot", profile: "java-cs", proposalId: "java-spring-1", channel: 0, priority: 1 }
				];
			if (jobDescription.includes("asp.net"))
				return [
					{ preference: 1, title: "asp.net", profile: "java-cs", proposalId: "asp-1", channel: 0, priority: 1 }
				];
		}
		return [
			// { preference: 1, title: "fullstack", profile: "wp-django", proposalId: "full-stack-5", channel: 0, priority: 4 },
			// { preference: 2, title: "fullstack", profile: "node-php", proposalId: "full-stack-2", channel: 0, priority: 3 },
			{ preference: 1, title: "fullstack", profile: "laravel-ruby", proposalId: "full-stack-1", channel: 0, priority: 4 },
			{ preference: 2, title: "fullstack", profile: "javascript", proposalId: "full-stack-2", channel: 0, priority: 3 },
		];
	}
}

window.submitProposal = async function (jobId, countryName, profile, proposalId, hourlyRate, jobTitle, jobCountry, priority, channel, preventOverwrite, callbackSuccess, callbackFailed) {
	if (!jobId) {
		console.log("jobId is null.");
		return false;
	}
	if (!profile) {
		console.log("profile is null.");
		return false;
	}
	if (!proposalId) {
		console.log("proposalId is null.");
		return false;
	}
	let proposal = window.myProposals[proposalId];
	if (!proposal) {
		console.log("No proposal found: " + proposalId);
		return false;
	}
	if (countryName == "United States")
		priority += 3;
	else if (countryName == "Canada" || countryName == "Australia" || countryName == "Qutar")
		priority += 2;
	else if (countryName == "United Kingdom" || countryName == "Switzerland" || countryName == "Sweden")
		priority += 1;
	console.log(`%c-- sending auto apply: ${proposalId} / ${jobId} / ${channel}`, 'color: #fe40ff');
	var proposalJson = {
		boost: 50,
		proposal: proposal,
		hourlyRate: hourlyRate || 25
	};
	try {
		const response = await fetch(`${window.SERVER_URL}/api/v2/apply/$/${profile}/${jobId}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				proposalJson: JSON.stringify(proposalJson, null, '\t'),
				jobTitle: jobTitle || "",
				jobCountry: jobCountry || "",
				priority: priority || "",
				channel: channel || window.CHANNEL || "",
				preventOverwrite: preventOverwrite
			})
		});
		const applyData = await response.json();
		console.log(applyData);
		if (applyData.success && applyData.already) {
			console.log(`%c[${new Date().toLocaleTimeString()}]  already applied: ${proposalId} / ${jobId} / ${channel}`, 'color: #fe40ff');
			const labelAuto = document.createElement("button");
			labelAuto.className = "up-label-auto";
			labelAuto.style.cssText = "background: #00adff80;";
			labelAuto.innerText = `👍 ${profile} / ${proposalId}`;
			labelAuto.title = `priority = ${applyData.priority || 0},  channel = ${applyData.channel || 0}`;
			labelAuto.onclick = function (e) {
				e.stopPropagation();
				if (!confirm(`Will cancel this application, Really?\n${jobTitle}\n${profile} / ${proposalId}`)) return;
				fetch(`${window.SERVER_URL}/api/v2/apply/$/${profile}/${jobId}/`, {
					method: 'DELETE'
				}).then((response) => {
					return response.json();
				}).then((deleteData) => {
					console.log(deleteData);
					if (deleteData.success) {
						console.log(`%c--- deleted apply: ${proposalId} / ${jobId}`, 'color: #fe40ff');
						labelAuto.remove();
					}
					else
						console.log(`%c--- failed to delete apply: ${proposalId} / ${jobId}\n${deleteData.error}`, 'color: #fe40ff');
				}).catch(error => {
					console.log(error);
				});
			}
			typeof callbackSuccess === "function" && callbackSuccess(labelAuto);
		}
		else if (applyData.success) {
			console.log(`%c[${new Date().toLocaleTimeString()}]  applied: ${proposalId} / ${jobId} / ${channel}`, 'color: #fe40ff');
			const labelAuto = document.createElement("button");
			labelAuto.className = "up-label-auto";
			labelAuto.style.cssText = "cursor: pointer;";
			labelAuto.innerText = `👍 ${profile} / ${proposalId}`;
			labelAuto.title = `priority = ${priority},  channel = ${channel}`;
			labelAuto.onclick = function (e) {
				e.stopPropagation();
				if (!confirm(`Will cancel this application, Really?\n${jobTitle}\n${profile} / ${proposalId}`)) return;
				fetch(`${window.SERVER_URL}/api/v2/apply/$/${profile}/${jobId}/`, {
					method: 'DELETE'
				}).then((response) => {
					return response.json();
				}).then((deleteData) => {
					console.log(deleteData);
					if (deleteData.success) {
						console.log(`%c--- deleted apply: ${proposalId} / ${jobId}`, 'color: #fe40ff');
						labelAuto.remove();
					}
					else
						console.log(`%c--- failed to delete apply: ${proposalId} / ${jobId}\n${deleteData.error}`, 'color: #fe40ff');
				}).catch(error => {
					console.log(error);
				});
			}
			typeof callbackSuccess === "function" && callbackSuccess(labelAuto);
		}
		else {
			console.error(`%c--- failed to auto apply: ${proposalId} / ${jobId} / ${channel}\n${applyData.error}`, 'color: #ffc107');
			typeof callbackFailed === "function" && callbackFailed();
		}
		return applyData;
	} catch (error) {
		console.log(error);
		return error;
	}
}


window.myProposals = {

	"asp-1": `Hello 👍👍👍
I am a highly skilled and experienced ASP.NET full-stack developer with 7+ years of experience. I have extensive experience in C# and ASP.NET. And also have experience in React/Vue/Node, Javascript/TypeScript, Web3, Tailwind CSS, REST API/GraphQL/WebSocket and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past ASP.NET projects:
https://clubflyers.com    (C#/ASP.NET + Canvas + Fabric.js + Three.js)
https://creator.clubflyers.com/home/logocreator    (C#/ASP.NET + Vue + SVG + Canvas)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"full-stack-1": `Hello 👍👍👍
I am a highly skilled and experienced full-stack engineer with 7+ years of experience. I have extensive experience in PHP/Laravel/WordPress, Node/Express/Nest, React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Tailwind CSS, REST API/GraphQL/WebSocket and so on. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
- Hire captains online
https://thecaptapp.com    (Laravel + Vue + Bootstrap)
- Landing/Portal
https://www.zuut.co    (React + Next + Node + Express + MaterialUI + Firebase + Vercel)
https://maison.work    (React + Next + Node + Express + MaterialUI + Heroku)
https://ndb.money    (React + Gatsby + AWS Amplify)
- Food booking & delivery:
https://fitfoodfresh.com    (WordPress + React + Reveal + Bootstrap)
- DeFi/NFT/Web3
https://farmhero.io    (React + Web3)
https://wizard.financial    (React + Bootstrap + Web3)
https://studio.manifold.xyz    (Vue + Tailwind CSS + Web3)
https://dragonkart.com    (Vue + Nuxt + Node + Express + Tailwind CSS + Web3)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"java-spring-1": `Hello 👍👍👍
I am a highly skilled and experienced Java full-stack developer with 7+ years of experience. I have extensive experience in Java, Kotlin, Spring Framework, Spring Boot, Hibernate, Maven/Gradle, CI/CD, Microservice, Kubernetes, Docker and so on. And also have experience in React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Web3, Tailwind CSS, REST API/GraphQL/WebSocket and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

WWW.NYYU.IO is one of my past similar project that I built using Java, Spring Boot, Oracle database and AWS Elastic Beanstalk.
https://www.nyyu.io    (Spring Boot + React + Gatsby + GraphQL + Oracle Database + AWS)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"laravel-1": `Hello 👍👍👍
I am a highly skilled and experienced PHP full-stack developer with 7+ years of experience. I have extensive experience in PHP and Laravel. And also have experience in React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
- Hire captains online
https://thecaptapp.com    (Laravel + Vue + Bootstrap)
- Vitamin Shop
https://www.vitawake.co.uk    (Laravel + Wix)
- Sport Tournament
https://padelintour.com    (Laravel + Tailwind CSS)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"django-flask-1": `Hello 👍👍👍
I am a highly skilled and experienced Python full-stack developer with 3+ years of experience. I have extensive experience in Python, Django and Flask. And also have experience in React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"ruby-1": `Hello 👍👍👍
I am a highly skilled and experienced Ruby on Rails full-stack developer with 3+ years of experience. I have extensive experience in Ruby on Rails. And also have experience in React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.

As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
	Marketplace for Hotel Reservations
https://www.roomertravel.com    (Ruby On Rails)
- Coffee supply chain platyform
https://crema.co    (Ruby on Rails + Vue)
- Events Management System
https://eventstaffing.co.uk    (Ruby on Rails)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"wordpress-1": `Hello 👍👍👍
I am a highly skilled and experienced WordPress developer with 7+ years of experience. I have extensive experience in PHP, WordPress and WooCommerce. And I am excellent in frontend development including HTML/CSS, Javascript, React/Vue and Responsive Design. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design. I am confident in my ability to be helpful for any kind of your work.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on.

Here are some of my past projects:
https://abandonedempress.com    (WordPress + Bootstrap)
https://uldfire.com    (WordPress + Divi)
https://4dmain.com    (WordPress + Elementor)
https://everythingcartagena.com    (WordPress + WooCommerce + Divi + Bootstrap)
https://cojinmimos.com    (WordPress + WooCommerce + Elementor)
https://www.mydoctorspick.com    (WordPress + WooCommerce + Elementor + Vue)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"full-stack-2": `Hi. As an experienced web developer with expertise in both frontend and backend development, I believe I am an ideal candidate for this project.

Over the years, I have honed my skills in creating responsive and visually appealing user interfaces using modern frontend technologies such as HTML, CSS, JavaScript, React, Vue, Tailwind CSS etc. Additionally, my proficiency in backend development with languages like PHP, Python, Javascript and frameworks like Laravel, WordPress, Django, Express enables me to build robust and scalable web applications.

You can check my past projects here:
- Company/Service Portal
https://pichler.pro    (Laravel)
https://dankmemer.lol    (React + Next + Node)
- Betting:
https://www.bsmma.com    (Laravel + Vue)
- Vitamin Shop
https://www.vitawake.co.uk    (Laravel + Wix)
- Tire Shop
https://zohr.com    (React + Bootstrap + Ruby on Rails + Heroku)
- CMS/Ecommerce
https://uldfire.com    (WordPress + Divi)
https://4dmain.com    (WordPress + Elementor)
https://www.kcg-vet.com    (WordPress + WooCommerce + Elementor)
https://everythingcartagena.com    (WordPress + WooCommerce + Divi + Bootstrap)

My attention to detail, strong problem-solving abilities, and passion for clean and efficient code make me a valuable asset to any development team. Understanding the importance of effective communication, I am committed to maintaining open and regular communication throughout the project's lifecycle. I am responsive to feedback and will actively collaborate with you to ensure your vision is brought to life.

I am confident that my technical skills and experience align perfectly with your project requirements. I am eager to discuss the project further and demonstrate how my expertise can contribute to its success. Thank you for considering my proposal.

Looking forward to the possibility of working together.

Best regards`,


	"laravel-2": `Hi. As an experienced PHP full stack developer with proficiency in Laravel and Vue/React, I am confident in my ability to deliver exceptional results for your project.

With years of experience in Laravel, I have successfully built and maintained complex web applications, ensuring they are robust, scalable, and secure. My expertise extends to frontend development using Vue and React, allowing me to create dynamic and interactive user interfaces that enhance the overall user experience.

You can check my past projects here:
- Company/Service Portal
https://pichler.pro    (Laravel)
- Betting:
https://www.bsmma.com    (Laravel + Vue)
- Video Ad management
https://openmedialogic.com    (Laravel + Bootstrap + Three.js)

Effective communication is paramount to a successful project, and I prioritize regular and transparent communication with my clients. I am responsive to feedback and am committed to understanding and fulfilling your specific requirements.

I am confident that my technical skills, combined with my attention to detail and problem-solving abilities, make me the ideal candidate for your project. I am eager to discuss the project in more detail and showcase how my expertise can contribute to its success.

Thank you for considering my proposal. I look forward to the opportunity to work with you.

Best regards`,


	"wordpress-2": `Hi. As an experienced WordPress developer with a strong background in various themes and plugins, I believe I possess the skills and expertise necessary to successfully complete your project.

Throughout my career, I have worked extensively with WordPress, developing custom themes and implementing plugins to meet clients' unique requirements. I am well-versed in HTML, CSS, and PHP, allowing me to create visually stunning and functional websites.

With a keen eye for detail, I ensure that every project I undertake is responsive, user-friendly, and optimized for search engines. Whether it's customizing existing themes or developing bespoke solutions, I am committed to delivering high-quality work that exceeds expectations.

You can check my past WordPress here:
https://tmsfirst.com    (WordPress + Bootstrap)
https://www.basquiat.com    (WordPress + Divi)
https://hyperkodes.com    (WordPress + Elementor)
https://www.kcg-vet.com    (WordPress + WooCommerce + Elementor)

I pride myself on effective communication and collaboration with clients. I am confident in my ability to meet your deadlines while maintaining the highest quality standards.

I would be delighted to discuss your project further. Thank you for considering my proposal, and I look forward to the opportunity to collaborate with you.

Best regards`,


	"blockchain-4": `Hello 👍👍👍
I am a highly skilled and experienced Web3/Blockchain developer. I have solid experience in Web3/Blockchain development including Web3, Smart Contract, Solidity, NFT and so on. And also experienced in modern Web/Web3 technologies including React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past Web3/Blockchain projects:
- DeFi
farmhero.io    (React + Web3)
- NFT Mint & Marketplace
wizard.financial    (React + Bootstrap + Web3)
- NFT Mint
https://studio.manifold.xyz    (Vue.js + Tailwind CSS + Web3)
- NFT Game
dragonkart.com    (Vue + Nuxt + Node + Tailwind CSS + Web3)

I am a dedicated and self-motivated professional with a strong attention to detail. I am confident in my ability to meet project deadlines and deliver high-quality work. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"react-4": `Hello 👍👍👍
I am a highly skilled full-stack developer with extensive experience in React/Next/Gatsby, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
- Grow Builder
https://www.zuut.co    (React + Next + Node + Express + MaterialUI + Firebase + Vercel)
- Office Rent
https://maison.work    (React + Next + Node + Express + MaterialUI + Heroku)
- Company/Service Portal
https://ndb.money    (React + Gatsby + AWS Amplify)
https://ndb.technology    (React + Gatsby + AWS Amplify)
- Token Sale/Auction Service
https://www.nyyu.io    (Spring Boot + React + Gatsby + GraphQL + Oracle Database + AWS)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"node-4": `Hello 👍👍👍
I am a highly skilled full-stack developer with extensive experience in React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
- Grow Builder
https://www.zuut.co    (React + Next + Node + Express + MaterialUI + Firebase + Vercel)
- Office Rent
https://maison.work    (React + Next + Node + Express + MaterialUI + Heroku)
- Company/Service Portal
https://ndb.money    (React + Gatsby + AWS Amplify)
https://ndb.technology    (React + Gatsby + AWS Amplify)
- Token Sale/Auction Service
https://www.nyyu.io    (Spring Boot + React + Gatsby + GraphQL + Oracle Database + AWS)
- NFT Mint
https://studio.manifold.xyz    (Vue + Tailwind CSS + Web3)
- NFT Game
https://dragonkart.com    (Vue + Nuxt + Node + Express + Tailwind CSS + Web3)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"vue-4": `Hello 👍👍👍
I am a highly skilled full-stack developer with extensive experience in Vue, Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket  and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
https://thecaptapp.com    (Laravel + Vue + Bootstrap)
https://studio.manifold.xyz    (Vue + Tailwind CSS + Web3)
https://dragonkart.com    (Vue + Nuxt + Node + Express + Tailwind CSS + Web3)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"svelte-4": `Hello 👍👍👍
I am a highly skilled full-stack developer with extensive experience in Svelte/SvelteKit, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket and so on.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"full-stack-4": `Hi, I hope this proposal finds you well. I am thrilled to submit my application for your website development project. As a highly skilled and experienced Full Stack Developer, I believe I am the perfect fit for your project.

With 8+ years of industry experience, I have successfully delivered numerous web development projects, showcasing my expertise in both front-end and back-end technologies. I am proficient in HTML, CSS, JavaScript, and have a strong command over popular frameworks such as React and Vue.

My approach to website development is centered around creating user-friendly, responsive, and visually appealing websites that align with the client's requirements. I am adept at designing intuitive user interfaces and implementing robust functionality to ensure seamless user experiences.

I understand the importance of clear and effective communication in project collaboration. I will maintain regular communication throughout the development process, providing updates and addressing any concerns promptly.

Moreover, I am committed to delivering projects on time and within the agreed budget, while maintaining high standards of code quality and security. I am confident in my ability to meet your project's objectives and exceed your expectations.

I would love the opportunity to discuss your project in more detail and provide you with a comprehensive plan tailored to your specific needs. Thank you for considering my application, and I look forward to the possibility of working together.

Best regards`,


	"react-5": `Hi. As an experienced JavaScript full stack developer with expertise in React and MERN stacks(MongoDB, Express.js, React, Node.js), I am confident in my ability to deliver exceptional results for your project.

With a strong background in both frontend and backend development, I possess the skills necessary to build robust and scalable web applications. My experience with the MERN stacks allows me to develop efficient and interactive user interfaces using React and Next/Gatsby, while also implementing server-side functionalities using various backend stacks such as Node/Express/Nest, PHP/Laravel, Python/Django and so on.

You can check my past projects here:
https://vavato.com    (React + Next + Node)
https://farmhero.io    (React + Web3)
https://wizard.financial    (React + Bootstrap + Web3)
https://www.fieldworktracker.com    (Django + React + Stripe)
https://www.onthesnow.com    (Django + React + Next + Node)

Effective communication is crucial for project success, and I prioritize regular and transparent communication with my clients. I am responsive to feedback, seek clarification when needed, and provide progress updates to ensure we are aligned throughout the development process.

I take great pride in my problem-solving skills and adaptability, allowing me to tackle challenges effectively and deliver innovative solutions. I am dedicated to providing the highest quality of work while maintaining efficiency and cost-effectiveness.

I would be thrilled to discuss your project further and showcase my portfolio of successful JavaScript projects developed using the React and MERN stacks. Thank you for considering my proposal, and I look forward to the opportunity to collaborate with you.

Best regards`,


	"node-5": `Hi. As an experienced JavaScript full stack developer with expertise in React, Vue, and Node, I am confident in my ability to deliver exceptional results for your project.

With a strong background in frontend and backend development, I possess the skills necessary to create dynamic and engaging web applications. I have extensive experience in developing responsive user interfaces using React and Vue, ensuring seamless user experiences across different devices and platforms.

Furthermore, my proficiency in Node.js enables me to build robust server-side applications, implement RESTful APIs, and work with databases such as MongoDB and PostgreSQL. I prioritize writing clean, modular, and maintainable code to ensure the scalability and longevity of the projects I work on.

Effective communication is a priority for me, and I am committed to keeping you informed, seeking feedback, and collaborating closely to achieve your project goals. I take great pride in my problem-solving skills and adaptability, enabling me to address challenges effectively and deliver innovative solutions. I am dedicated to providing the highest quality of work while maintaining efficiency and cost-effectiveness.

I would be thrilled to discuss your project in more detail. Thank you for considering my proposal, and I look forward to the opportunity to collaborate with you.

Best regards`,


	"vue-5": `Hi. As an experienced JavaScript full stack developer with expertise in Vue and MEVN (MongoDB, Express.js, Vue.js, Node.js) stacks, I am confident in my ability to deliver exceptional results for your project.

With a strong background in both frontend and backend development, I possess the skills necessary to build robust and scalable web applications. My experience with the MEVN stacks allows me to develop efficient and interactive user interfaces using Vue and Nuxt, while also implementing server-side functionalities using various backend stacks such as Node/Express/Nest, PHP/Laravel, Ruby on Rails and so on.

You can check my past projects here:
https://www.bsmma.com    (Laravel + Vue.js)
https://crema.co    (Ruby on Rails + Vue)
https://weddingexpo.co    (Ruby on Rails + Vue)

Effective communication is crucial for project success, and I prioritize regular and transparent communication with my clients. I am responsive to feedback, seek clarification when needed, and provide progress updates to ensure we are aligned throughout the development process.

I take great pride in my problem-solving skills and adaptability, allowing me to tackle challenges effectively and deliver innovative solutions. I am dedicated to providing the highest quality of work while maintaining efficiency and cost-effectiveness.

I would be thrilled to discuss your project further and showcase my portfolio of successful JavaScript projects developed using Vue and MEVN stacks. Thank you for considering my proposal, and I look forward to the opportunity to collaborate with you.

Best regards`,


	"svelte-5": `Hi. I am an experienced JavaScript developer. With several years of experience in web development, I am confident that I have the skills and expertise needed to complete this project successfully.

As a Svelte developer, I have worked on various projects ranging from simple landing pages to complex web applications. I am proficient in HTML, CSS, JavaScript and TypeScript, and have a strong understanding of front-end development.

I am committed to delivering high-quality work that meets your expectations and requirements. I am available to start immediately and look forward to discussing this opportunity further.

Thank you for considering my proposal.`,


	"blockchain-5": `Hi. As an experienced individual blockchain developer, I have the skills and expertise required to successfully complete your project.

With 3 years of experience in blockchain technology, including decentralized applications (dApps), smart contracts, and blockchain protocols like Ethereum and Hyperledger, I am well-versed in the latest industry trends and best practices.

My services include smart contract development, dApp development, tokenization and ICO development, blockchain integration, smart contract auditing, and blockchain consulting.

I prioritize clear communication and collaboration to ensure that your specific requirements are met and that you are updated on the progress and milestones.

I am dedicated to delivering high-quality work within agreed-upon timelines, and I possess strong problem-solving and analytical skills to overcome any challenges that may arise during development.

I offer my expertise in designing and developing secure and efficient smart contracts using Solidity, Rust, Python, Cairo or other programming languages.

I can build intuitive user interfaces for dApps and implement seamless interactions with the blockchain. I am excellent in modern frontend development including React and Web3.

If you need assistance with token creation and ICO development, I can guide you through the process while ensuring compliance with relevant regulations and industry best practices.

I am available for a call to discuss your project in more detail or to provide any additional information you may require.

Thank you for considering my proposal. I am excited about the opportunity to work with you and contribute to the success of your blockchain project.`,


	"full-stack-5": `Hi. 👍
I am a skilled Full Stack Developer with 7+ years of experience and a proven track record of delivering successful web development projects.

Here's why I believe I am the right fit for your project:
- Experience: With expertise in front-end and back-end technologies, I have worked on various web development projects across different industries.
- Technical Proficiency: I am proficient in HTML5, CSS3, JavaScript, React, Vue, PHP, Python, Node.js, MySQL, and MongoDB.
- Customized Solutions: I will create a tailored website that reflects your brand identity and engages your target audience effectively.
- Timely Delivery: I am committed to delivering your project on schedule without compromising quality.
- Strong Communication: I maintain open and transparent communication, ensuring your project's success.

Thank you for considering my proposal. I look forward to discussing the project further. Kindly let me know the next steps.
Best regards`,


	"ecommerce-7": `Hello 👍👍👍
I am a highly skilled and experienced Ecommerce developer with 5+ years of experience. I have extensive experience in Shopify and Ecommerce Website development. And I am excellent in frontend development including HTML/CSS, Javascript, React/Vue and Responsive Design. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
- Wall Art Shop
https://www.americanflat.com    (Shopify)
- Baby Pillow Shop
https://www.mimospillow.ca    (Shopify)
- Hire captains online
https://thecaptapp.com    (Laravel + Vue.js + Bootstrap)
- Hire maid online:
https://www.maidfinder.sg    (CodeIgnitor + Webflow + Bootstrap)
- Food booking & delivery:
https://fitfoodfresh.com    (WordPress + React + Reveal + Bootstrap)
- Tire Shop
https://zohr.com    (React + Ruby on Rails + Heroku)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"frontend-7": `Hello 👍👍👍
I am a highly skilled and experienced frontend developer with 7+ years of experience. I have extensive experience in React/Next/Gatsby, Vue/Nuxt, Javascript/TypeScript, Node/Express/Nest, Tailwind CSS, REST API/GraphQL/WebSocket, SEO and so on.
I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.
I am confident in my ability to be helpful for any kind of your work.

Here are some of my past projects:
- Company/Service Portal
https://www.zuut.co    (React + Next + MaterialUI + Node + Firebase + Vercel)
https://ndb.technology    (React + Gatsby + AWS Amplify)
https://ndb.money    (React + Gatsby + AWS Amplify)
- Hire captains online
https://thecaptapp.com    (Laravel + Vue.js + Bootstrap)
- Food booking & delivery:
https://fitfoodfresh.com    (WordPress + React + Reveal + Bootstrap)
- DeFi & NFT
farmhero.io    (React + Web3)
wizard.financial    (React + Bootstrap + Web3)
https://studio.manifold.xyz    (Vue.js + Tailwind CSS + Web3)
dragonkart.com    (Vue + Nuxt + Node + Tailwind CSS + Web3)
- Online drawing & desinging
https://clubflyers.com    (C#/ASP.NET + Canvas + Fabric.js + Three.js)
https://creator.clubflyers.com/home/logocreator    (C#/ASP.NET + Vue.js + SVG + Canvas)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"shopify-7": `Hello 👍👍👍
I am a highly skilled and experienced Shopify developer with 4+ years of experience. I have extensive experience in Shopify/Shopify Plus development, API integration, theme customization, Response design, and so on. And I am excellent in frontend development including HTML/CSS, Javascript, React/Vue and Responsive Design. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design.
As a full-stack developer, I have extensive experience in Backend and frontend development, database management, cloud management, web hosting, SEO and so on. I am confident in my ability to be helpful for any kind of your work.

Here are some of my past Shopify projects:
- Wall Art Shop
https://www.americanflat.com    (Shopify)
- Baby Pillow Shop
https://www.mimospillow.ca    (Shopify)

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the possibility of working with you.
Thank you.`,


	"webflow-7": `Hello 👍👍👍
I am a highly skilled and experienced Webflow developer. I have strong background and solid experience in Webflow and HTML/CSS. I have extensive experience in building landing page and Ecommerce websites. I mastered in W3C standard web protocols and mobile/responsive/browser sensitive design. I am confident in my ability to be helpful for any kind of your work.

You can check my past Webflow projects:
https://www.converge.net
https://www.experiencefutures.org
https://fairdealmarketing.com

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"chrome-extension-7": `Hello 👍
I am an experienced Chrome Extension developer interested in your project. With a strong background in JavaScript, HTML, CSS, and the Chrome Extension API, I am confident in my ability to meet your requirements effectively.

As an experienced front-end developer, I have extensive experience in HTML/CSS, Javascript/TypeScript, React/Vue/Node, Tailwind CSS, REST API/GraphQL/WebSocket and so on.

I am a dedicated and self-motivated professional with a strong attention to detail. I am also a good communicator and can collaborate effectively with remote teams.
I look forward to the opportunity to work with you.
Thank you.`,


	"frontend-8": `Hi. As an experienced individual frontend developer, I possess the skills and expertise required to successfully complete your project.

With 6+ years of experience, I am proficient in HTML, CSS, JavaScript, and modern frontend frameworks like React and Vue.

My services include UI/UX design implementation, frontend development for dynamic and interactive web applications, and mobile optimization for seamless user experiences on smartphones and tablets.

I ensure cross-browser compatibility, making your website functional across all major web browsers.

My code is clean, efficient, and optimized for performance to provide a fast and smooth user experience.

You can check my past projects here:
- Gaming Coaching Platform
https://skoonova.com    (React + Next + Node + Tailwind CSS)
- Grow Builder
https://www.zuut.co    (React + Next + Node + MaterialUI + Firebase + Vercel)
- Office Rent
https://maison.work    (React + Next + Node + MaterialUI + Heroku)
- Car Subscription Platform
https://www.carify.com    (Vue + Nuxt)

I prioritize effective communication and collaboration throughout the project, using project management tools like Trello or Jira.

I am dedicated to delivering high-quality work within deadlines, and I have strong problem-solving abilities.

I would be happy to discuss your project further or answer any questions you may have. Please feel free to reach out at your convenience.

Thank you for considering my proposal. I look forward to the opportunity to work with you and bring your project to life.`,


	"ecommerce-8": `Hi. I am an experience developer with a strong background in ecommerce development and extensive experience in building ecommerce, Shopify, WordPress websites, I possess the skills necessary to create visually appealing, user-friendly, and high-performing online stores.

Throughout my career, I have successfully completed numerous ecommerce projects, earning positive feedback from clients for my technical expertise, attention to detail, and ability to meet project deadlines. I am dedicated to delivering exceptional quality work while ensuring the highest level of customer satisfaction.
		
Effective communication is paramount, and I prioritize regular and transparent communication with my clients. I am responsive to feedback, seek clarification when needed, and provide progress updates to ensure we are aligned throughout the development process.
		
I am well-versed in ecommerce best practices, including SEO optimization, inventory management, and integration with third-party applications. I am also experienced in migrating existing stores to Shopify or WordPress and providing ongoing maintenance and support.
		
I take great pride in my problem-solving skills and attention to detail, allowing me to identify and resolve issues efficiently. I am committed to delivering projects that meet your specific requirements and exceed your expectations.
		
I would be delighted to discuss your project further and showcase my portfolio of successful ecommerce projects. Thank you for considering my proposal, and I look forward to the opportunity to collaborate with you.
		
Best regards`,


	"shopify-8": `Hi. I am an experience developer with a strong background in Shopify development and extensive experience in building ecommerce websites, I possess the skills necessary to create visually appealing, user-friendly, and high-performing online stores. I am proficient in customizing Shopify themes, implementing payment gateways, and optimizing the overall shopping experience for customers.

Throughout my career, I have successfully completed numerous Shopify projects, earning positive feedback from clients for my technical expertise, attention to detail, and ability to meet project deadlines. I am dedicated to delivering exceptional quality work while ensuring the highest level of customer satisfaction.

Effective communication is paramount, and I prioritize regular and transparent communication with my clients. I am responsive to feedback, seek clarification when needed, and provide progress updates to ensure we are aligned throughout the development process.

I am well-versed in ecommerce best practices, including SEO optimization, inventory management, and integration with third-party applications. I am also experienced in migrating existing stores to Shopify and providing ongoing maintenance and support.

You can check my past Shopify projects here:
- Bambinos Baby Food Shop & Delivery
https://bambinosbabyfood.com    (Shopify)
- Poster Design
https://racedayprints.com    (Shopify + Printful + PageFly)

I take great pride in my problem-solving skills and attention to detail, allowing me to identify and resolve issues efficiently. I am committed to delivering projects that meet your specific requirements and exceed your expectations.

I would be delighted to discuss your project further and showcase my portfolio of successful Shopify and ecommerce projects. Thank you for considering my proposal, and I look forward to the opportunity to collaborate with you.

Best regards`,


	"webflow-8": `Hi. 👍
Very excited to submit my proposal for your Webflow project. As a webflow specialist, I have extensive experience in creating visually stunning and highly functional websites using this platform.

My approach to web design is centered around understanding your unique needs and creating a custom solution that exceeds your expectations. Whether you need a simple landing page or a complex e-commerce site, I have the expertise to deliver a website that not only looks great but also performs well.

I am excellent in Responsive Design, modern frontend development and SEO. And also experienced in Figma.

In addition to my technical skills, I am also committed to providing exceptional customer service. I understand the importance of clear communication and timely delivery, and I always strive to exceed my clients' expectations.

Here are some of my past Webflow projects:
https://visitDays.com
https://usernurture.com
https://goodbits.io
https://www.cymonz.com

I look forward to the opportunity to work with you on your Webflow project.
Thank you.`,


	"scraping-9": `Hi. I am an experienced web developer and web scraper. As an experienced programmer with a deep understanding of web protocol and data extraction, I am confident in my ability to meet and exceed your expectations for this project.

I have successfully completed numerous web scraping projects, gathering data from various sources such as websites, APIs, and online directories. My expertise includes using Python, C# and Javascript based scraping frameworks such as Selenium, Puppeteer, BeautifulSoup, Scrapy, HtmlAgilityPack, as well as leveraging advanced techniques like dynamic content handling and anti-bot measures.

With your guidance, I will meticulously analyze the target website's structure and design a robust scraping strategy to ensure accurate and efficient data retrieval. I will also implement error handling mechanisms and establish data validation protocols to maintain the integrity and reliability of the extracted information.

"When you share a website, I will scrape everything that you want."

I am excited about the opportunity to work with you and demonstrate my expertise in web scraping. I look forward to further discussing the project and finding the best approach to achieve your desired outcomes. Thanks`,



	"automation-9": `Hi. As an experienced expert in this field, I have the skills and knowledge necessary to successfully complete your project.

With 5+ years of experience in web & desktop automation, I am proficient in using tools like Selenium WebDriver, Puppeteer, AutoIt, UiPath and Power Automate.

My services include web scraping, automated testing, task automation, desktop application automation, process automation, and custom script development.

I prioritize clear communication and collaboration throughout the project, ensuring that your specific requirements are met and that you are informed about the progress and milestones.

I am dedicated to delivering high-quality work within agreed-upon timelines, and I possess strong problem-solving and troubleshooting skills to overcome any challenges that may arise during the automation process.

I have a proven track record of designing scalable and maintainable automation solutions, ensuring long-term reliability and ease of maintenance.

I offer my expertise in automating repetitive tasks, extracting data from websites, and streamlining workflows to improve productivity and reduce manual errors.

If you would like to discuss your project in more detail or have any questions, please feel free to reach out. I am available for a call or to provide any additional information you may need.

I am eager to work with you and provide efficient and reliable desktop/web automation solutions. Thank you for considering my proposal.`,



	"bot-auto-9": `Hello 👍👍👍
I am an experienced programmer and automation expert. I have extensive experience in various kinds of automation works.
I am a dedicated and self-motivated professional with a strong attention to detail. I am confident in my ability to be helpful for any kind of your work.
I look forward to the possibility of working with you.
Thank you.`,


}
