const { ethers, network, run } = require("hardhat");
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const servicooUniswapLiquidityFactory = await ethers.getContractFactory("ServicooUniswapLiquidity");
    const servicooUniswapLiquidity = await servicooUniswapLiquidityFactory.deploy("0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
    await servicooUniswapLiquidity.deployed()

    const WAIT_BLOCK_CONFIRMATIONS = 6;
    await servicooUniswapLiquidity.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

    console.log("Contract address:", servicooUniswapLiquidity.address);

    await run(`verify:verify`, {
        address: servicooUniswapLiquidity.address,
        constructorArguments: ["0xC36442b4a4522E871399CD717aBDD847Ab11FE88"],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });