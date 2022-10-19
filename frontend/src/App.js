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
import Card from 'react-bootstrap/Card';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Badge from 'react-bootstrap/Badge';
import { FaMoon, FaSun } from "react-icons/fa";

const CONTRACT_ADDRESS = '0x1ACB17558F64eC2254eA940adf6ab29E1239dE15';
const STORED_THEME = localStorage.getItem("theme");

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [account, setAccount] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const [owner, setOwner] = useState("");
  const [formData, setFormData] = useState({name: "", text: "", tipValue: "0.001"});
  const [senders, setSenders] = useState([]);
  const [show, setShow] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  const types = [
    {value: '0.001', label: 'Normal 😘'},
    {value: '0.002', label: '+ Coca 🥰'},
    {value: '0.003', label: '+ Chips 🤩'}
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
      setupEventListener();
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
        setTipLoading(true);

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

        setTipLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
        setTipLoading(false);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getSenders = async () => {
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buyMeABurger.abi, signer);

        const _senders = await connectedContract.getSenders();
  
        setSenders(_senders);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getContractBalance = async () => {
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buyMeABurger.abi, signer);

        let _balance = await connectedContract.getContractBalance();
        _balance = ethers.utils.formatUnits(_balance, 'ether');

        setContractBalance(_balance);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getOwner = async () => {
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buyMeABurger.abi, signer);

        const _owner = await connectedContract.owner();
  
        setOwner(_owner);

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
            <>
              { tipLoading ? 
              <Button variant="warning" size="lg">
                Tiping...please wait.
              </Button> :
              <Button variant="primary" size="lg" onClick={tip}>
                Buy me a burger
              </Button> }
            </>
            :
            <Button variant="info" size="lg" onClick={connectWallet}>
              Connect wallet
            </Button>}

            {account && (owner.toUpperCase() === account.toUpperCase()) ?
            <Button variant="success" size="lg">
              Withdraw ({contractBalance} eth)
            </Button>:''}
          </div>
        </Form>
      </>
    );
  }

  const bought = (val) => {
    val = ethers.utils.formatUnits(val, 'ether');

    let _bought;

    if(val < 0.002 ) {
      _bought = "a burger";
      
    } else if (val < 0.003) {
      _bought = "a burger + coca";
    } else {
      _bought = "a burger + coca + chips";
    }
    
    return _bought;
  }

  const shortAddr = (addr) => {
    let prefix = addr.substring(0, 5);
    let suffix = addr.substring(addr.length - 4);
    let short = prefix + "..." + suffix;
    return short;
  };

  const renderSender = () => {
    return (
      <>
        {senders.map((item, index) => 
        <Card key={index} className="text-center mb-4">
          <Card.Header>{item.name}({shortAddr(item.sender)}) bought {bought(item.tipValue)}</Card.Header>
          <Card.Body>
            <Card.Text>
              {item.text}
            </Card.Text>
          </Card.Body>
        </Card>
        )}
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

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buyMeABurger.abi, signer);

        connectedContract.on("MsgSent", (name, text, tipValue, sender) => {
          console.log(name, text, tipValue.toNumber(), sender);

          getSenders();
        });

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
    checkConnectWallet();
    getSenders();
    getOwner();
    getContractBalance();
    if (STORED_THEME === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Container>
        <Row>
          <Navbar expand="lg">
            <Container fluid>
              <Navbar.Brand href="/">
                Buy-Me-A-Burger <Badge bg="warning" text="dark">Goerli</Badge>
              </Navbar.Brand>
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
          {senders.length > 0 ? 
          <Col md={12} className='mx-auto text-center'>
            <h2 className='mt-5 mb-4 senders-tit'>Senders</h2>
            <Row className='senders'>
              <Col sm={12} md={6} className='mx-auto text-center'>
                {renderSender()}
              </Col>
            </Row>
          </Col> : '' }
        </Row>
      </Container>
      <ToastContainer containerPosition='fixed' position='bottom-center'>
        <Toast onClose={() => setShow(false)} show={show} delay={5000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Bootstrap</strong>
            <small className="text-muted">2 seconds ago</small>
          </Toast.Header>
          <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default App;
