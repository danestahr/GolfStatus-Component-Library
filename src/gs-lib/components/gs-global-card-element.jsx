import React, {Component} from 'react';
import './gs-global-card-element.scss';

// -- The react app using this component must have GlobalPayments setup for use,
//    which means that the following js script is loaded in the app (add it to app header):
//      <script src= https://js.paygateway.com/secure_payment/v1/globalpayments.js></script>
// -- Required props: apiKey, environment, autoComplete, onSuccess(), onError(), formValid, saveBtnQueryStr
// -- Optional props: buttonText, isLoading()
export default class GSGlobalCardElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newBtn: null,
      oldBtn: null,
      formValid: props.formValid,
      buttonActive: false,
      cardForm: null,
      cardFilled: false,
      expFilled: false,
      cvvFilled: false,
    }
  }

  componentDidMount() {
    this.props.isLoading?.(true);
    // create Global submit div with proper attrs/styles
    let newBtn = document.createElement('div');
    newBtn.setAttribute('id', 'global-submit-button');
    Object.assign(newBtn.style, {
      display: 'inline-flex',
      width: '100%'
    })

    let oldBtn = document.querySelector(this.props.saveBtnQueryStr);
    oldBtn.style.display = 'none';
    oldBtn.parentNode.appendChild(newBtn);
    this.setState({newBtn, oldBtn})

    GlobalPayments.configure({
      'X-GP-Api-Key' : this.props.apiKey,
      'X-GP-Environment' : this.props.environment,
      'enableAutocomplete': this.props.autoComplete,
    });

    const cardForm = GlobalPayments.ui.form({
      fields : {
        'card-number': {
          target: '#card-number',
          placeholder:  'Card Number',
        },
        'card-expiration': {
          target: '#card-expiration',
          placeholder: 'MM / YYYY',
        },
        'card-cvv': {
          target: '#card-cvv',
          placeholder: 'CVV',
        },
        'submit': {
          target: '#global-submit-button',
          text: this.props.buttonText || 'Save',
        }
      },

      styles : {
        '#secure-payment-field': {
          border: 'none',
          background: 'transparent',
          width: '100%',
          padding: '4px',
          'box-sizing': 'border-box',
          display: 'block',
          'line-height': '1.6'
        },

        '#secure-payment-field::placeholder': {
          opacity: '.5'
        },

        '#secure-payment-field:focus': {
          'box-shadow': '0 0 0 4px rgba($grey-400, .2)',
          'outline': 'none',
        },

        '#secure-payment-field:focus::placeholder': {
          'color': 'rgba(0,0,0,0)',
        },

        // '#secure-payment-field.invalid': {
        //   'color': '#FFCDA6',
        // },

        // default it to disabled
        'button#secure-payment-field': {
          'background': '#e5e5e5',
          color: '#a2a2a2',
          'border-radius': '8px',
          'text-align': 'center',
          cursor: 'default',
          'pointer-events': 'none',
          transition: '0.3s',
          'font-size': '11.5px',
          'font-weight': '500',
          'text-transform': 'uppercase',
          height: '40px',
          'letter-spacing': '2px',
          'line-height': '0',
          padding: '8px 12px 8px 12px',
        },
      },
    });

    // GP response handlers
    GlobalPayments.on('error', (resp) => {
      this.props.onError(resp.error.message);
      this.props.isLoading?.(false);
    });

    cardForm.on('token-success', (resp) => {
      if(this.props?.returnCardInfo){
        this.props.onSuccess(resp)
      }
      else{
        this.props.onSuccess(resp.temporary_token);
      }
      
    });

    cardForm.on('token-error', (resp) => {
      this.props.onError(resp.error.message);
      this.props.isLoading?.(false);
    });

    cardForm.on("card-number-test", (resp) => {
      this.props?.inputTouched?.()
      this.props?.cardUpdated?.({...this.state, cardFilled: resp.valid})
      this.setState({cardFilled: resp.valid}, this.toggleButton);
    });
    cardForm.on("card-expiration-test", (resp) => {
      this.props?.inputTouched?.()
      this.props?.cardUpdated?.({...this.state, expFilled: resp.valid})
      this.setState({expFilled: resp.valid}, this.toggleButton);
    });
    cardForm.on("card-cvv-test", (resp) => {
      this.props?.inputTouched?.()
      this.props?.cardUpdated?.({...this.state, cvvFilled: resp.valid})
      this.setState({cvvFilled: resp.valid}, this.toggleButton);
    });

    cardForm.ready(() => {
      // stop loading once Global components finish loading
      this.props.isLoading?.(false);
    });

    this.setState({cardForm});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.formValid !== this.props.formValid) {
      this.setState({formValid: this.props.formValid}, this.toggleButton);
    }
  }

  toggleButton() {
    const allComplete = this.state.cardFilled && this.state.expFilled && this.state.cvvFilled && this.state.formValid;

    // if all is good but button is disabled, activate the button
    if (!this.state.buttonActive && allComplete) {
      this?.props?.cardUpdated?.({cardFilled: true, expFilled: true, cvvFilled: true})
      this.setState({buttonActive: true});
      this.state.cardForm.addStylesheet({ 'button#secure-payment-field': {
        'background': '#232323',
        color: '#fff',
        cursor: 'pointer',
        'pointer-events': 'auto'
      }});
    } else if (this.state.buttonActive && !allComplete) {
      // if button active, but not all good, deactivate button
      this.setState({buttonActive: false});
      this.state.cardForm.addStylesheet({ 'button#secure-payment-field': {
        cursor: 'default',
        'background': '#e5e5e5',
        color: '#a2a2a2',
        'pointer-events': 'none'
      }});
    }
  };

  componentWillUnmount() {
    if (this.state.newBtn) {
      this.state.newBtn.remove();
    }
    if (this.state.oldBtn) {
      this.state.oldBtn.style.display = '';
    }
  }

  getValidClass = (className, valid) => {
    return `${className}${!valid ? " invalid" : ""}`
  }

  render(){
    return (
      <gs-global-card-element>
        <div className="outer full-width">
          <div className="label">Card Number <span className="asterisk">*</span></div>
          <div id="card-number-wrapper" className={this.getValidClass("global-input-wrapper", this.state.cardFilled)}>
            <div id="card-number" className="full-width center"></div>
          </div>
        </div>
        <div id="exp-cvv">
          <div className="outer">
            <div className="label">Expiration <span className="asterisk">*</span></div>
            <div id="card-expiration-wrapper" className={this.getValidClass("global-input-wrapper half", this.state.expFilled)}>
              <div id="card-expiration" className="full-width center"></div>
            </div>
          </div>
          <div className="outer">
            <div className="label">CVV <span className="asterisk">*</span></div>
            <div id="card-cvv-wrapper" className={this.getValidClass("global-input-wrapper half", this.state.cvvFilled)} >
              <div id="card-cvv" className="full-width center"></div>
            </div>
          </div>
        </div>
      </gs-global-card-element>
    );
  }
};
