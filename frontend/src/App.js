import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import logo from './logo.png';
import buyMeABurger from './artifacts/contracts/BuyMeABurger.sol/BuyMeABurger.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import { FaMoon, FaSun } from "react-icons/fa";

const CONTRACT_ADDRESS = '0xE567a5ED1E5EA7cEfa31E913077c0E4d519051DD';
const STORED_THEME = localStorage.getItem("theme");

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [account, setAccount] = useState("");
  const [formData, setFormData] = useState({name: "", text: "", tipValue: "0.0000001"});
  const types = [
    {value: '0.0000001', label: 'Normal 😘'},
    {value: '0.0000002', label: '+ Coca 🥰'},
    {value: '0.0000003', label: '+ Chips 🤩'}
  ]

  const checkConnectWallet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      setAccount(accounts[0]);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      setAccount(accounts[0]);

    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setFormData(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  };

  const tip = async () => {
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buyMeABurger.abi, signer);

        let txn = await connectedContract.buyMeABurger(
          formData.name,
          formData.text,
          {value: ethers.utils.parseUnits(formData.tipValue, 'ether')}
        );
  
        console.log("Tiping...please wait.")
        await txn.wait();
        
        console.log(`Sent, see transaction: https://goerli.etherscan.io/tx/${txn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderForm = () => {
    return (
      <>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name: </Form.Label>
            <Form.Control type="text" name="name" onChange={handleInputChange}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message: </Form.Label>
            <Form.Control as="textarea" rows={3} name="text" onChange={handleInputChange}/>
          </Form.Group>
          
          <div className="mb-3">
            {types.map((type, index) => 
            <Form.Check
              key={index}
              inline
              label={type.label}
              name='tipValue'
              value={type.value}
              type='radio'
              id={`type-${index}`}
              onChange={handleInputChange}
            />)}
          </div>
          
          <div className='my-2'>{formData.tipValue} eth</div>
              
          <div className="d-grid gap-2">
            {account ?
            <Button variant="primary" size="lg" onClick={tip}>
              Buy me a burger
            </Button> :
            <Button variant="success" onClick={connectWallet}>
              Connect wallet
            </Button>}
          </div>
        </Form>
      </>
    );
  }

  const drakModeToggle = () => {
    if (darkMode) {
      setDarkMode(false);
      localStorage.setItem("theme", "light");
      document.body.classList.remove('dark');
    } else {
      setDarkMode(true);
      localStorage.setItem("theme", "dark");
      document.body.classList.add('dark');
    }
  }
  
  useEffect(() => {
    checkConnectWallet();
    if (STORED_THEME === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, [])

  return (
    <>
      <Container>
        <Row>
          <Navbar expand="lg">
            <Container fluid>
              <Navbar.Brand href="/">Buy-Me-A-Burger</Navbar.Brand>
              <Form className="d-flex">
                <Button variant="light" onClick={drakModeToggle}>
                  {darkMode ? <FaSun color='orange'/> : <FaMoon color='orange'/>}
                </Button>
              </Form>
            </Container>
          </Navbar>
        </Row>
        <Row>
          <Col sm={12} md={6} className='mx-auto text-center'>
            <img src={logo} className="App-logo" alt="logo" />
            {renderForm()}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
