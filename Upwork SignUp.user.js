// ==UserScript==
// @name         Upwork SignUp
// @namespace    http://valloon.me/
// @version      23.07.15
// @description  automatically sign up on upwork
// @author       Valloon
// @match        https://www.upwork.com/*
// @match        http://web.valloon.me/*
// @match        http://localhost/*
// @icon         https://www.upwork.com/favicons.ico
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

// @require http://code.jquery.com/jquery-latest.js


const SERVER_URL = "http://localhost";
// const SERVER_URL = "http://web.valloon.me";
const CHANNEL = 0;
const DEBUG_MODE = 0;


const HOME_URL=`${SERVER_URL}/api/v2/account/history/today`;
(async function() {
    'use strict';
    console.log('Script loaded');

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function alertBig(message) {
        let alertBox=document.querySelector("#zzz-alert-big");
        if(alertBox){
            alertBox.innerText=message;
        }else{
            alertBox = document.createElement("button");
            alertBox.id="zzz-alert-big";
            alertBox.style.cssText = "position: fixed;bottom: 10rem;right: 2rem;min-width: 4rem;height: 4rem;border-radius: 10rem;text-align: center;font-size: 1.5rem;color: rgb(255, 255, 255);background: #ff0000a0;z-index: 999999;";
            alertBox.innerText = message;
            alertBox.onclick=function(e){
                if(this.stop){
                    this.stop=false;
                    alertBox.style.opacity="1";
                }else{
                    this.stop=true;
                    alertBox.style.opacity=".5";
                }
            }
            alertBox.oncontextmenu=function(e){
                e.preventDefault();
                alert("Click OK to continue");
            }
            document.body.appendChild(alertBox);
        }
        return alertBox.stop;
    }

    function alertMessage(message, onclick) {
        let alertMessage=document.querySelector("#zzz-alert-message");
        if(!message){
            alertMessage && alertMessage.remove();
        } else if(alertMessage){
            alertMessage.innerText=message;
            document.title=message;
        }else{
            alertMessage = document.createElement("label");
            alertMessage.id="zzz-alert-message";
            alertMessage.style.cssText = "position: fixed;top: 7rem;right: 0.5rem;padding: 0.25rem 0.75rem;border-radius: 1rem;color: #fff;background: #00f;opacity: .75;z-index: 999999;pointer-events: none;";
            alertMessage.innerText = message;
            (typeof onclick==="function") && (alertMessage.onclick=onclick);
            document.body.appendChild(alertMessage);
            document.title=message;
        }
    }

    function alertMessageNext(message, onclick) {
        let alreadyCount=document.querySelectorAll(".zzz-alert-messages").length;
        let alertMessage = document.createElement("label");
        alertMessage.className="zzz-alert-messages";
        alertMessage.style.cssText = `position: fixed;top: ${9+alreadyCount*2}rem;right: 0.5rem;padding: 0.25rem 0.75rem;border-radius: 1rem;color: #fff;background: #00f;opacity: .75;z-index: 999999;pointer-events: none;`;
        alertMessage.innerText = message;
        (typeof onclick==="function") && (alertMessage.onclick=onclick);
        document.body.appendChild(alertMessage);
        document.title=message;
    }

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

    let exitTimeout = 99;
    if(!location.href.startsWith(SERVER_URL)){
        let linkHome = document.createElement("a");
        linkHome.href=HOME_URL;
        linkHome.style.cssText = "position: fixed;top: 0rem;right: 0rem;text-decoration: underline;z-index: 9999;";
        linkHome.innerText = HOME_URL;
        document.body.appendChild(linkHome);

        (async function(){
            while (true) {
                if(exitTimeout>=0){
                    if(!alertBig(exitTimeout)){
                        if(exitTimeout==0){
                            location.href=HOME_URL;
                            await new Promise(resolve => setTimeout(resolve, 30000));
                            return;
                        }
                        exitTimeout--;
                    }
                }else{
                    alertBig("_");
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        })();
    }

    async function runScript(){
        let signupData=GM_getValue("signupData");
        if(!signupData){
            location.href=HOME_URL;
            await new Promise(resolve => setTimeout(resolve, 30000));
            return;
        }
        unsafeWindow.emailNumber=signupData.nextNumber;
        try {
            const response = await fetch(`${SERVER_URL}/script/${signupData.scriptFilename}`);
            const scriptContent = await response.text();
            const script = document.createElement("script");
            script.textContent = scriptContent;
            document.body.appendChild(script);
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
        } catch (error) {
            console.error('Failed to get script:', error);
            alertMessage(error);
        }
        return false;
    }

    async function fixNotificationSetting(){
        try {
            const response = await fetch("https://www.upwork.com/ab/notification-settings/api/settings", {
                "method": "POST",
                "headers": {
                    "x-odesk-csrf-token": getCookie("XSRF-TOKEN"),
                    "x-odesk-user-agent": "oDesk LM",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.upwork.com/en-gb/ab/notification-settings/",
                "body": "{\"desktopCounter\":\"all\",\"desktopNotify\":\"all\",\"desktopSound\":\"false\",\"mobileNotify\":\"all\",\"mobileCounter\":\"all\",\"mobileSound\":\"false\",\"dashEmailFreq\":\"immediate\",\"dashEmailWhen\":\"all\",\"dashEmailPresence\":\"always\",\"allContracts\":\"mine\",\"allRecruiting\":\"mine\",\"receive_documents_digitally\":false,\"dash_desktop_all\":true,\"dash_desktop_important\":true,\"dash_desktop_never\":true,\"dash_desktop_sound\":true,\"dash_message_counter_all\":true,\"dash_message_counter_important\":true,\"dash_email_approximately\":true,\"dash_email_all\":true,\"dash_email_important\":true,\"dash_email_presence\":true,\"er_job_posted\":true,\"er_japp_submitted\":true,\"er_intv_acc\":true,\"er_intv_declined\":true,\"er_offer_updated\":true,\"er_job_will_expire\":true,\"er_job_expired\":true,\"er_no_intv\":true,\"pja_intv_accepted\":true,\"pja_offer\":true,\"pja_japp_declined\":true,\"pja_japp_rejected\":true,\"pja_job_change\":true,\"pja_japp_withdrawn\":true,\"cntr_hire\":true,\"cntr_timelog_begins\":true,\"cntr_terms\":true,\"cntr_end\":true,\"cntr_timelog\":true,\"cntr_fb_change\":true,\"cntr_offline_summary\":true,\"cntr_bpa_wk_buyer\":true,\"cntr_misc\":true,\"cntr_bpa\":true,\"grp_mem\":true,\"ref_profile\":true,\"ref_invite\":true,\"cntr_revoke\":true,\"subscription_event\":true,\"on_board_msg\":true,\"misc_local\":true,\"who_viewed_job\":true,\"connects_expiry\":true,\"connects_purchase\":true,\"job_recommendations\":true,\"marketing_email\":false,\"tc\":[]}",
            });
            const data = await response.json();
            console.log(`Notification setting fixed: `, data);
            alertMessageNext(`Notification setting fixed: `+JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to fix notification setting: ', error);
            alertMessage(error);
        }
        return false;
    }

    async function fixMembershipSetting(){
        try {
            const response = await fetch("https://www.upwork.com/ab/plans/api/subscription/subscribe", {
                "method": "POST",
                "headers": {
                    "x-odesk-csrf-token": getCookie("XSRF-TOKEN"),
                    "x-odesk-user-agent": "oDesk LM",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.upwork.com/nx/plans/membership/change-plan",
                "body": `{\"requestDate\":\"${new Date().toISOString()}\",\"pageDate\":\"${(new Date(new Date().getTime()-60000-Math.random()*120000)).toISOString()}\",\"paramFS\":\"outOfConnects\",\"planId\":20}`,
            });
            const data = await response.json();
            console.log(`Membership setting fixed: `, data);
            alertMessageNext(`Membership setting fixed: `+JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to fix membership setting: ', error);
            alertMessage(error);
        }
        return false;
    }

    async function fixVisibilityPrivate(){
        try {
            const response = await fetch("https://www.upwork.com/freelancers/settings/api/v1/profile/me/profile-access", {
                "method": "POST",
                "headers": {
                    "x-odesk-csrf-token": getCookie("XSRF-TOKEN"),
                    "x-odesk-user-agent": "oDesk LM",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.upwork.com/freelancers/settings/profile",
                "body": "{\"profileVisibility\":2}",
            });
            const data = await response.json();
            console.log(`Fix visibility to Private: `, data);
            alertMessageNext(`Fix visibility to Private: `+JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to fix visibility: ', error);
            alertMessage(error);
        }
        return false;
    }

    async function fixExperienceLevel(){
        try {
            const response = await fetch("https://www.upwork.com/freelancers/settings/api/v1/profile/me/contractor-tier", {
                "method": "PUT",
                "headers": {
                    "x-odesk-csrf-token": getCookie("XSRF-TOKEN"),
                    "x-odesk-user-agent": "oDesk LM",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.upwork.com/freelancers/settings/profile",
                "body": "{\"contractorTier\":3}",
            });
            const data = await response.json();
            console.log(`Fix experience level to Expert: `, data);
            alertMessageNext(`Fix experience level to Expert: `+JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to experience level: ', error);
            alertMessage(error);
        }
        return false;
    }

    async function reportSignupResult(signupInfo, profileTitle, state){
        try {
            let ipAddress=GM_getValue("ipAddress");
            state ??= signupInfo.state;
            const response = await fetch(`${SERVER_URL}/api/v2/account/${signupInfo.email}/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    password: signupInfo.password,
                    profile: signupInfo.category,
                    profileTitle: profileTitle || "",
                    state: state || "",
                    ip: ipAddress || "",
                })
            });
            const data = await response.json();
            console.log(data);
            if (data.success){
                console.log(`Reported: ${state || "OK"}`);
                alertMessage(`Reported: ${state || "OK"}`);
            }else{
                console.log(`Failed to report: ${state || "OK"}`);
                alertMessage(`Failed to report: ${state || "OK"}`);
            }
            return true;
        } catch (error) {
            console.error('Error:', error);
            alertMessage(error);
        }
        return false;
    }

    if(location.href.startsWith(SERVER_URL)){
        GM_deleteValue("signupData");
        GM_deleteValue("loginInfo");
        let roundCount=GM_getValue("roundCount")||0;
        roundCount++;
        if(roundCount>=5){
            document.title="!!! Reopen Me";
            GM_deleteValue("roundCount");
        }else{
            GM_setValue("roundCount", roundCount);
            try {
                const response = await fetch(`http://ip-api.com/json`);
                const data = await response.json();
                const ip=data.query;
                alertMessageNext(ip);
                GM_setValue("ipAddress", ip);
            } catch (error) {
                console.error('Error:', error);
            }
            let tryCount=0;
            while (true) {
                if(!alertBig(tryCount)){
                    if(tryCount>0){
                        console.log(`Retrying to get signup data... ${tryCount}`);
                        try {
                            const response = await fetch(`${SERVER_URL}/api/v2/account/need2?channel=${CHANNEL}&try=${tryCount}`);
                            const signupData = await response.json();
                            if (signupData.success) {
                                GM_setValue("signupData",signupData);
                                alertMessage(`${signupData.nextNumber} / ${signupData.scriptFilename}`);
                                location.href="https://www.upwork.com/nx/signup/";
                                return;
                            }
                            alertMessage();
                            document.title=`${tryCount} on signup`;
                        } catch (error) {
                            console.error(`Error (${tryCount}):`, error);
                            alertMessage(`${error} (${tryCount})`);
                        }
                    }
                    tryCount++;
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }else if (location.pathname.endsWith('/ab/account-security/login')) {
        await runScript();
        let signupInfo=unsafeWindow.signupInfo;
        alertMessageNext(signupInfo.email);
        for (let i = 0; i < 5; i++) {
            if (!document.querySelector("#login_username") || document.querySelector("#login_username").disabled) {
                console.log("Username input is disabled... " + i);
                await new Promise(r => setTimeout(r, 3000));
            }
        }
        let emailInput = document.querySelector("#login_username");
        if (!emailInput || emailInput.disabled) {
            location.reload();
            return;
        }
        emailInput.value = signupInfo.email;
        emailInput.dispatchEvent(new Event("input"));
        document.querySelector("#login_password_continue").click();
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (document.querySelector("#login_password") && !document.querySelector("#login_password").disabled) break;
            if ([...document.querySelectorAll("#username-message")].filter(a => a.innerText.includes("Username is incorrect.")).length) {
                console.log("Email unregistered, signup... " + signupInfo.email);
                alertMessage("Email unregistered, signup... " + signupInfo.email);
                location.href = "https://www.upwork.com/nx/signup/"
                return;
            }
            console.log("Password input not found... " + i);
        }
        let passwordInput = document.querySelector("#login_password");
        if (!passwordInput || passwordInput.disabled) {
            location.reload();
            return;
        }
        passwordInput.value = signupInfo.password;
        passwordInput.dispatchEvent(new Event("input"));
        GM_setValue("loginInfo",signupInfo);
        document.querySelector("#login_control_continue").click();

        while(true){
            await new Promise(resolve => setTimeout(resolve, 3000));
            if ([...document.querySelectorAll("#password-message")].filter(a => a.innerText.includes("Password is incorrect.")).length) {
                console.log("Password incorrect... " + signupInfo.email);
                alertMessage("Password incorrect... " + signupInfo.email);
            }
        }
    } else if (location.pathname.endsWith('/nx/signup/') ) {
        await runScript();
        let signupInfo=unsafeWindow.signupInfo;
        alertMessageNext(signupInfo.email);
        for (let i = 0; i < 5; i++) {
            if (!document.querySelector("input[name=radio-group-2]")) {
                console.log("Input radio not found... " + i);
                await new Promise(r => setTimeout(r, 3000));
            }
        }
        let freelancerRadio = document.querySelector("input[name=radio-group-2]");
        if (!freelancerRadio) {
            location.reload();
            return;
        }
        freelancerRadio.checked = true;
        freelancerRadio.click();

        let createAccountButton = document.querySelector("button[data-qa=btn-apply]");
        createAccountButton.disabled = false;
        createAccountButton.click();

        while (true) {
            if (document.querySelector("#first-name-input")) break;
            await new Promise(r => setTimeout(r, 1000));
        }

        let firstNameInput = document.querySelector("#first-name-input");
        firstNameInput.value =signupInfo.firstName;
        firstNameInput.dispatchEvent(new Event("input"));
        let lastNameInput = document.querySelector("#last-name-input");
        lastNameInput.value = signupInfo.lastName;
        lastNameInput.dispatchEvent(new Event("input"));
        let emailInput = document.querySelector("#redesigned-input-email")
        emailInput.value = signupInfo.email;
        emailInput.dispatchEvent(new Event("input"));
        let passwordInput = document.querySelector("#password-input");
        passwordInput.value = signupInfo.password;
        passwordInput.dispatchEvent(new Event("input"));

        while (true) {
            await new Promise(r => setTimeout(r, 1000));
            document.querySelector("#country-dropdown>[data-test=dropdown-toggle]").click();
            console.log("Click Country Dropdown Div");
            let countryOption = [...document.querySelectorAll("#country-dropdown ul[role=listbox] li[role=option] span")].filter(a => a.innerText.includes(signupInfo.country))[0];
            if (countryOption) {
                countryOption.click();
                console.log("Click a Country");
                await new Promise(r => setTimeout(r, 1000));
                if (document.querySelector(".up-dropdown-toggle-title>span").innerText.includes(signupInfo.country)) {
                    console.log("Country Changed.");
                    break;
                }
            }
        }

        let promoCheck = document.querySelector("#checkbox-promo");
        promoCheck.checked = false;
        promoCheck.dispatchEvent(new Event("change"));
        let termsCheck = document.querySelector("#checkbox-terms");
        termsCheck.checked = true;
        termsCheck.dispatchEvent(new Event("change"));
        while(true){
            let createAccountButton=document.querySelector("#button-submit-form");
            createAccountButton && !createAccountButton.disabled && createAccountButton.click();
            let cookieAcceptButton = document.querySelector("#onetrust-accept-btn-handler");
            cookieAcceptButton && cookieAcceptButton.click();
            if ([...document.querySelectorAll(".error-message span")].filter(a => a.innerText.includes("This email is already in use.")).length) {
                console.log("Email already used, login..." + signupInfo.email);
                alertMessage("Email already used, login... ");
                location.href = "https://www.upwork.com/ab/account-security/login"
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    } else if (location.pathname.endsWith('/nx/signup/please-verify')) {
        await runScript();
        let signupInfo=unsafeWindow.signupInfo;
        alertMessageNext(signupInfo.email);
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
                alertMessage(`Verifying... ${i||""}`);
                const response = await fetch(`${SERVER_URL}/api/v2/account/${signupInfo.email}/email-verify?try=${i}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        login: signupInfo.emailUsername,
                        p: signupInfo.emailPassword,
                    })
                });
                const data = await response.json();
                console.log(data);
                if (data.success && data.url) {
                    alertMessage("Email verified: "+signupInfo.email);
                    location.href = data.url;
                    return;
                }else{
                    console.log("Email not verified", data.error);
                    alertMessageNext(`${data.error}`);
                    if(i==2){
                        [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Resend Verification Email")).forEach(a => a.click());
                        alertMessageNext(`Resend Verification Email`);
                    }
                }
            } catch (error) {
                console.warn('Error:', error);
                alertMessageNext(error);
            }
        }
        alertMessage("Failed to email-verify");
        exitTimeout = 10;
    } else if (location.pathname.includes('/nx/signup/verify-email/token/')) {
        alertMessage("Email verified and processing...");
    } else if (location.pathname.includes('/nx/create-profile/')) {
        await runScript();
        let signupInfo=unsafeWindow.signupInfo;
        alertMessageNext(signupInfo.email);
        while(true){
            if (location.pathname.endsWith('/nx/create-profile/') || location.pathname.endsWith('/nx/create-profile/welcome')) {
                [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Get started")).forEach(a => a.click());
            } else if (location.pathname.endsWith('/nx/create-profile/experience')) {
                while (true) {
                    let radio = document.querySelector("input[type=radio][value=NEW_TO_ME]");
                    if (radio) {
                        radio.checked = true
                        radio.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        document.querySelector("button[data-test=next-button]")?.click();
                        break;
                    }
                    await new Promise(r => setTimeout(r, 1000));
                }
            } else if (location.pathname.endsWith('/nx/create-profile/goal')) {
                let radio = document.querySelector("input[type=radio][value=MAIN_INCOME]");
                radio.checked = true
                radio.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/work-preference')) {
                let checks = document.querySelectorAll(".work-preference-options-container input[type=checkbox]");
                checks[0].checked = true
                checks[0].click();
                checks[1].checked = true
                checks[1].click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/resume-import')) {
                [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Fill out manually (15 min)") || a.innerText.includes("Fill in manually (15 min)")).forEach(a => a.click());
                [...document.querySelectorAll("[data-qa=resume-upload-confirmation-footer] button")].filter(a => a.innerText.includes("Start a new profile")).forEach(a => a.click());
            } else if (location.pathname.endsWith('/nx/create-profile/title')) {
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].profileTitle=unsafeWindow.setProfile({}).profileTitle;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/employment')){
                !unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].profileTitle && document.querySelector("[data-ev-label=wizard_previous]").click();
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].employmentHistory=unsafeWindow.setProfile({}).employmentHistory;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/education')){
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].educations=unsafeWindow.setProfile({}).educations;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/languages')){
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].englishLevel=unsafeWindow.setProfile({}).englishLevel;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/skills')){
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].generalSkills=unsafeWindow.setProfile({}).generalSkills;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/overview')){
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].profileOverview=unsafeWindow.setProfile({}).profileOverview;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/categories')){
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].multipleSpecialities=unsafeWindow.setProfile({}).multipleSpecialities;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/rate')){
                unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].rate=unsafeWindow.setProfile({}).rate;
                await new Promise(resolve => setTimeout(resolve, 100));
                document.querySelector("button[data-test=next-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/certifications')) {
                document.querySelector("button[data-test=skip-button]")?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/location')) {
                if(!unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].profileTitle){
                    location.href="title";
                    return;
                }
                unsafeWindow.setProfile(unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile']);
                await new Promise(resolve => setTimeout(resolve, 100));
                if (!document.querySelectorAll("button.fe-upload-btn.upload-btn img").length) {
                    // alertMessage(`Waiting for file upload...`);
                    // document.title=`!^$/${signupInfo.photoFiilename}/${signupInfo.email}`;
                    // exitTimeout=-1;
                    // while (true) {
                    //     let inputFileUpload=document.querySelector("input[type=file][name=imageUpload]");
                    //     if(!inputFileUpload){
                    //         [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Upload photo")).forEach(a => a.click());
                    //         await new Promise(r => setTimeout(r, 1000));
                    //         continue;
                    //     }
                    //     inputFileUpload.style.cssText="position: fixed;inset: 0px;z-index: 9999;";
                    //     if (document.querySelectorAll("img.cr-original-image").length) {
                    //         alertMessage("");
                    //         document.title="Photo uploaded";
                    //         await new Promise(resolve => setTimeout(resolve, 1000));
                    //         [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Attach photo")).forEach(a => a.click());
                    //         inputFileUpload.style.cssText="";
                    //         await new Promise(resolve => setTimeout(resolve, 1000));
                    //         exitTimeout=30;
                    //         break;
                    //     }
                    //     console.log(`Waiting for file upload...`);
                    //     await new Promise(r => setTimeout(r, 1000));
                    // }
                    // while (true) {
                    //     if (document.querySelectorAll("button.fe-upload-btn.upload-btn img").length) {
                    //         document.querySelector("button[data-test=next-button]")?.click();
                    //         break;
                    //     }
                    //     await new Promise(r => setTimeout(r, 1000));
                    // }
                    alertMessage(`Uploading photo...`);
                    while (!document.querySelectorAll("button.fe-upload-btn.upload-btn img").length) {
                        let inputFileUpload=document.querySelector("input[type=file][name=imageUpload]");
                        if(!inputFileUpload){
                            [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Upload photo")).forEach(a => a.click());
                            await new Promise(r => setTimeout(r, 1000));
                            continue;
                        }
                        break;
                    }
                    if (document.querySelectorAll("button.fe-upload-btn.upload-btn img").length) break;
                    try{
                        let response = await fetch(`${SERVER_URL}/script/${signupInfo.photoFiilename}`);
                        let data = await response.blob();
                        let metadata = {
                            type: 'image/jpeg'
                        };
                        let file = new File([data], "test.jpg", metadata);
                        let obj = {};
                        obj.target = { files: [file] };
                        let elUpCImageCrop = searchTree(unsafeWindow.$nuxt.$children[0], 'UpCImageCrop');
                        if(!elUpCImageCrop){
                            alertMessage("elUpCImageCrop is null");
                            await new Promise(r => setTimeout(r, 1000));
                            continue;
                        }
                        elUpCImageCrop.addFile(obj);
                    }catch(error){
                        alertMessage(`Failed to download/upload photo: ` + error);
                        console.error(`Failed to download/upload photo: `, error);
                    }
                    while (true) {
                        if (document.querySelectorAll("img.cr-original-image").length) {
                            alertMessage("Photo uploaded");
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Attach photo")).forEach(a => a.click());
                            break;
                        }else if(![...document.querySelectorAll("button")].filter(a => a.innerText.includes("Attach photo")).length){
                            break;
                        }else if(![...document.querySelectorAll("button")].filter(a => a.innerText.includes("Attach photo")).length){
                            break;
                        }
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    while (true) {
                        if (![...document.querySelectorAll("button")].filter(a => a.innerText.includes("Saving")).length) break;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    if(document.querySelectorAll("img[alt=portrait]").length){
                        while (true) {
                            if (!document.querySelector("input[type=file][name=imageUpload]")) break;
                            await new Promise(r => setTimeout(r, 1000));
                        }
                    }
                }else if([...document.querySelectorAll(".has-error span")].filter(a => a.innerText.includes("Phone number must be verified")).length){
                    let profileTitle;
                    try {
                        profileTitle = unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].profileTitle;
                    } catch (error) {
                        console.log(error);
                    }
                    if(reportSignupResult(signupInfo, profileTitle, "failed-phone")){
                        exitTimeout=1;
                        return;
                    }
                }else{
                    document.querySelector("button[data-test=next-button]")?.click();
                    console.log(`Auto Click Next on '${location.pathname}'`);
                }
            } else if (location.pathname.endsWith('/nx/create-profile/submit')) {
                [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Submit profile"))[0]?.click();
            } else if (location.pathname.endsWith('/nx/create-profile/finish')) {
                exitTimeout=10;
                let fixSettingResult=await fixNotificationSetting() && await fixMembershipSetting() && await fixVisibilityPrivate() && await fixExperienceLevel();
                if (signupInfo.category) {
                    let profileTitle;
                    try {
                        profileTitle = unsafeWindow.$nuxt.$store._vm.$data.$$state['mini-profile'].profileTitle;
                    } catch (error) {
                        console.log(error);
                    }
                    if(reportSignupResult(signupInfo, profileTitle)){
                        if(fixSettingResult) exitTimeout=1;
                        return;
                    }
                } else {
                    if(fixSettingResult) exitTimeout=1;
                    return;
                }
            } else {
                document.querySelector("button[data-test=next-button]")?.click();
                console.log(`Auto Click Next on '${location.pathname}'`);
                alertMessageNext(`Auto Click Next on '${location.pathname}'`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } else if (location.pathname.includes('/nx/find-work/')) {
        let loginInfo=GM_getValue("loginInfo");
        if(!loginInfo){
            alertMessage(`loginInfo not found`);
            exitTimeout=1;
            return;
        }
        await runScript();
        let signupInfo=unsafeWindow.signupInfo;
        alertMessageNext(signupInfo.email);
        exitTimeout=10;
        let fixSettingResult=await fixNotificationSetting() && await fixMembershipSetting() && await fixVisibilityPrivate() && await fixExperienceLevel();
        if (signupInfo.category) {
            let profileTitle;
            try {
                profileTitle = unsafeWindow.$nuxt.$store._vm.$data.$$state.profile.profile.title;
            } catch (error) {
                console.log(error);
            }
            if(reportSignupResult(signupInfo, profileTitle)){
                if(fixSettingResult) exitTimeout=1;
                return;
            }
        } else {
            if(fixSettingResult) exitTimeout=1;
            return;
        }
    } else {
        alertMessage(`Unknown page: '${location.pathname}'`);
        exitTimeout=10;
    }
})();