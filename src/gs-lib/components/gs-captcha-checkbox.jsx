import React, { useEffect, useState } from "react";
import "./gs-captcha-checkbox.scss";

// this component requires that Checkbox captcha script has been loaded in the App
// to do that, put the following in the Apps head:
// <script src="https://www.google.com/recaptcha/enterprise.js?render=explicit" async defer></script>
// -- Required props:
//      - captchaKey: the key for the captcha from Google
//      - setToken: a function that uses the captcha token passed to it
//      - action: string (one word) describing what the captcha is for (https://cloud.google.com/recaptcha-enterprise/docs/actions-website)
const GSCaptchaCheckbox = ({ captchaKey, setToken, action, theme, captchaIDUpdated }) => {
    const [captchaID, setCaptchaID] = useState(null)
  useEffect(() => {
    if (grecaptcha?.enterprise?.render) {
      // render captcha
      const captchaCallback = token => {
        setToken(token);
      };

      const captchaExpiredCallback = () => {
        setToken(null);
      };

      if(captchaID === null){
        grecaptcha.enterprise.ready?.(async () => {
            const widgetID = grecaptcha.enterprise.render("captcha-widget", {
              sitekey: captchaKey,
              action: action,
              callback: captchaCallback,
              theme: theme ?? "light",
              "expired-callback": captchaExpiredCallback,
            });
            setCaptchaID(widgetID)
            captchaIDUpdated?.(widgetID)
          });
      }
      
    }
    return () => {captchaIDUpdated?.(null)}
  }, [grecaptcha?.enterprise?.render, setToken, captchaKey, action, theme]);

  return (
    <div className="captcha-wrapper">
      <div id="captcha-widget" />
    </div>
  );
};

export default GSCaptchaCheckbox;
