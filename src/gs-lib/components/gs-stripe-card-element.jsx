import React, {Component} from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import './gs-stripe-card-element.scss';

// The react app using this component must have stripe setup for use,
// as this must be used inside of Stripe's Elements component
export default class GSStripeCardElement extends Component {
  constructor(props) {
    super(props);
  }

  onChange = (event) => {
    if(event.error){
      this.props?.setError?.(event?.error?.message)
    }
    else{
      this.props?.setErro?.('')
    }

  }

  render(){
    return (
      <gs-stripe-card-element>
        <div className='border'>
          <CardElement onChange={this.onChange} />
        </div>
      </gs-stripe-card-element>
    );
  }
};
