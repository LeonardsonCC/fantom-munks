import React, { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";

import Web3 from "web3";
import FantomMunksAbi from "../contract/abis/FantomMunks.json";

import "react-toastify/dist/ReactToastify.css";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

function Index() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [maxMintable, setMaxMintable] = useState(0);
  const [supply, setSupply] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      setIsReady(false);
      return;
    }

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        setAddress(accounts[0]);
        let w3 = new Web3(window.web3.currentProvider);
        setWeb3(w3);
        let c = new w3.eth.Contract(FantomMunksAbi, contractAddress);
        setContract(c);

        c.methods
          .totalSupply()
          .call()
          .then((supply) => {
            setIsReady(true);
            setSupply(supply);
          })
          .catch((err) => {
            setIsReady(false);
            setAddress(null);
            setSupply(0);
            setMaxMintable(0);
            setContract(null);
            toast.error("Check if you are using Fantom Network", {
              theme: "colored",
            });
          });

        c.methods
          .maxMintable()
          .call()
          .then((maxMintable) => {
            setMaxMintable(maxMintable);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        setIsReady(false);
        toast.error("Check if you are using Fantom Network", {
          theme: "colored",
        });
      });
  }

  function handleClaim() {
    let tx = claim();
    console.log(tx);
  }

  async function loadData() {
    let totalSupply = await contract.methods.totalSupply().call();

    setSupply(totalSupply);

    contract.methods
      .maxMintable()
      .call()
      .then((maxMintable) => {
        setMaxMintable(maxMintable);
      })
      .catch((err) => console.log(err));
  }

  function claim() {
    setIsClaiming(true);
    let _price = web3.utils.toWei("1");

    const claimPromise = new Promise((resolve, reject) => {
      contract.methods
        .claim(1)
        .send({
          to: contractAddress,
          from: address,
          value: _price,
        })
        .once("error", (err) => {
          console.log(err);
          setIsClaiming(false);
          reject();
        })
        .then((receipt) => {
          console.log(receipt);
          setIsClaiming(false);
          loadData();

          const link = `https://ftmscan.com/tx/${receipt.transactionHash}`;

          resolve(link);
        });
    });

    toast.promise(claimPromise, {
      pending: "Claiming...",
      success: {
        render: (link) => `Claimed!`,
      },
      error: "Something went wrong... Try again!",
    });
  }

  return (
    <div className="max-w-5xl mx-auto h-screen">
      <div className="my-3 flex flex-row justify-between items-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-800 to-red-500">
          FANTOM MUNKS
        </h1>

        <button
          className="h-10 bg-gradient-to-r from-purple-400 to-red-500 px-4 rounded-xl text-white"
          onClick={connectWallet}
        >
          {isReady
            ? address?.substring(0, 6) +
              "..." +
              address?.substring(address.length - 4, address.length)
            : "Connect"}{" "}
          {}
        </button>
      </div>

      <div className="flex flex-row justify-between mt-10">
        <div>
          <div>
            This is the first collection created inside the{" "}
            <span>MUNKVERSE.</span>
            <br />
            <br />
            What is the <span>MUNKVERSE</span>?
            <br />
            It's just where all Munks live.
            <br />
            Munk is a character created by 16 years old's mind around 2008.
            <br />
            I've never stopped drawing this same character.
            <br />
            Now I think it's perfect for NFTs.
            <br />
            I hope you stick around to see more.
            <br />
            <br />
            This would not be possible without the amazing project:
            <br />
            <a
              className="text-blue-600"
              href="https://www.fantomchess.com"
              target="_blank"
            >
              fantomchess.com
            </a>
            <br />
            <br />
          </div>

          {isReady ? (
            <button
              className="h-10 bg-gradient-to-r from-purple-400 to-red-500 px-4 rounded-xl text-white"
              onClick={handleClaim}
            >
              {isClaiming ? "loading..." : "Claim (1 FTM)"}
            </button>
          ) : (
            <div>
              <br></br>Connect your wallet to claim
            </div>
          )}

          <div className="flex flex-row my-5">
            <div className="flex flex-col pr-7">
              <span className="font-bold text-xl">10.000</span>
              <span>Munks to be claim</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl">1 FTM</span>
              <span>Mint price</span>
            </div>
            <div className="flex flex-col pl-7">
              {isReady && (
                <>
                  <span className="font-bold text-xl">
                    {maxMintable - supply}
                  </span>
                  <span>Munks available </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div>
            <Image
              src="/assets/munk1.gif"
              alt="munk"
              width="450"
              height="450"
              className="rounded-xl"
            />
          </div>

          <br />
        </div>
      </div>
      <footer className="flex flex-row align-center justify-center">
        <a
          href="https://twitter.com/munks_nft"
          target="_blank"
          className="mx-5"
        >
          <Image src="/assets/twitter.svg" alt="munk" width="20" height="20" />
        </a>

        <a
          href={`https://ftmscan.com/address/${contractAddress}`}
          className="mx-5"
          target="_blank"
        >
          <Image src="/assets/fantom.svg" alt="munk" width="20" height="20" />
        </a>
      </footer>
      <ToastContainer />
    </div>
  );
}

export default Index;
