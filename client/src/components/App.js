/* eslint-disable */

// Import React package
import React from "react";

// Import component CSS style
import "./App.css";

// Import helper functions
import getWeb3 from "../helpers/getWeb3";

//////////////////////////////////////////////////////////////////////////////////|
//        CONTRACT ADDRESS           &          CONTRACT ABI                      |
//////////////////////////////////////////////////////////////////////////////////|                                                             |
const CONTRACT_ADDRESS = require("../contracts/Certificate.json").networks[5777].address
const CONTRACT_ABI = require("../contracts/Certificate.json").abi;
const CONTRACT_NAME = require("../contracts/Certificate.json").contractName

export default class App extends React.Component {
  state = { 
    web3Provider: null,
    accounts: null,
    networkId: null,
    contract: null,
    storageValue: null,
    receiverAddress: '',
    tokenUri: '',
    result: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the network ID
      const networkId = await web3.eth.net.getId();

      // Create the Smart Contract instance
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ 
        web3Provider: web3,
        accounts: accounts,
        networkId: networkId,
        contract: contract
      });

      // Get the value from the contract to prove it worked and update storageValue state
      this.getMethod()

      this.handleMetamaskEvent()

      this.handleContractEvent()

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  setResult = async (result) => {
    this.setState({ result });
  }


  //TODO: set method to interact with Storage Smart Contract
  setMethod = async () => {
    const { accounts, contract, receiverAddress, tokenUri } = this.state;

    // Stores a given value, 5 by default.
    const transaction = await contract.methods.awardItem(receiverAddress, tokenUri).send({ from: accounts[0] })
    console.log(transaction)

    // Get the updated value from the contract and updates storageValue state
    this.getMethod()
  }

  //TODO: get function to interact with Storage Smart Contract
  getMethod = async () => {
    const { contract, receiverAddress } = this.state;

    // Get the value from the contract to prove it worked.
    if (receiverAddress != '') {
      const response = await contract.methods.balanceOf(receiverAddress).call();
      this.setState({ storageValue: response })
    }
  }

  setAddress = (address) => {
    this.setState({ receiverAddress: address });
  }

  setTokenUri = (tokenUri) => {
    this.setState({ tokenUri: tokenUri });
  }

  test = function (event) {
    console.log("New event: %o", event)
    if (event.event == "Transfer") {
      // console.log(state)
      this.setState({ result: event.returnValues }) 
      console.log(this.state.result);
      alert("Token sent succesfully")
    }
  }

  handleContractEvent = async () => {
    if (!this.state.contract) return
    console.log(this.state.contract.events.allEvents());
    this.state.contract.events.allEvents()
      .on("connected", function (subscriptionId) {
        console.log("New subscription with ID: " + subscriptionId)
      })
      .on('data', this.test.bind(this))
  }

  handleMetamaskEvent = async () => {
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      alert("Incoming event from Metamask: Account changed 🦊")
      window.location.reload()
    })

    window.ethereum.on('chainChanged', function (networkId) {
      // Time to reload your interface with the new networkId
      alert("Incoming event from Metamask: Network changed 🦊")
      window.location.reload()
    })
  }

  render() {
    if (!this.state.web3Provider) {
      return <div className="App-no-web3">
        <h3>No Web3 connection... 🧐</h3>
        <p>Please connect via MetaMask for this demo.</p>
        {/* Add auto metamask login check*/}
      </div>;
    }
    return (
      <div className="App">

        {/* ------------------- Certification demo ------------------- */}
        <div className="App-simplestorage-example">

          {/* DApp Header */}
          <h1>Certification Demo</h1>
          <br />

          <h2>Metamask Connection Succesfull</h2>
          <p>User address: {this.state.accounts}</p>


          {/* DApp Information */}
          <h2>Smart Contract: {CONTRACT_NAME} 🧮</h2>
          <p>Contract address: {CONTRACT_ADDRESS}</p>
          <p>
            If your certification was sent successfully, below will show
            a stored value of 1 (by default).
          </p>

          {/*  DApp Actions  */}
          <p>
            Input an address to send a token
          </p>
          <input 
            value={this.state.receiverAddress}
            onChange={e => this.setAddress(e.target.value)}
            type="string"
          />
          <p>
            Input token uri
          </p>
          <input 
            value={this.state.tokenUri}
            onChange={e => this.setTokenUri(e.target.value)}
            type="string"
          />
          <p>
            Try clicking the button below 👇 to award receiver addresss with a token
          </p>
          <button type='button' onClick={this.setMethod}>Send token</button>
          <br />
          {
            this.state.result != null &&
            <>
              <h2>Token sent succesfully</h2>
              <p>Receiver address: {this.state.result.to}</p>
              <p>Generated token id: {this.state.result.tokenId}</p>
            </>
          }
        </div>
        {/* ---------------------------------------------------------- */}

      </div>
    );
  }
}