const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x66f40a3Dd8ea94746cF58412aE8c1af4b6ebEA13"
    const TOKEN0 = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49" //usdt
    const TOKEN1 = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F" // usdc
    const [deployer] = await ethers.getSigners();

    const token0Amount = BigNumber.from(Number(100 * (10 ** 6)).toString()) // dai
    const token1Amount = BigNumber.from(Number(100 * (10 ** 6)).toString()) // usdc
    const token0 = await ethers.getContractAt("IERC20", TOKEN0);
    const token1 = await ethers.getContractAt("IERC20", TOKEN1);
    const contract = await ethers.getContractAt("ServicooUniswapLiquidity", contractAddress)
    await token0.approve(contractAddress, token0Amount)
    await token1.approve(contractAddress, token1Amount)


    res = await contract.mintNewPosition(TOKEN0, TOKEN1
        , token0Amount, token1Amount, 0, {
        gasPrice: 2100000000,
        gasLimit: 30000000
    })

    console.log(res)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });