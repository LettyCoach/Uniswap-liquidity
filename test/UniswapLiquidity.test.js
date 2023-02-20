const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("ServicooUniswapLiquidity", function () {

    
    let servicooUniswapLiquidity;
    const TOKEN0 = "0x6B175474E89094C44Da98b954EedeAC495271d0F" //dai
    const TOKEN1 = "0xdAC17F958D2ee523a2206206994597C13D831ec7" // usdt

    function getSlot(userAddress, mappingSlot) {
        return ethers.utils.solidityKeccak256(
            ["uint256", "uint256"],
            [userAddress, mappingSlot]
        )
    }

    async function checkSlot(erc20, mappingSlot) {
        const contractAddress = erc20.address
        const userAddress = ethers.constants.AddressZero
    
        const balanceSlot = getSlot(userAddress, mappingSlot)
    
        // storage value must be a 32 bytes long padded with leading zeros hex string
        const value = 0xDEADBEEF
        const storageValue = ethers.utils.hexlify(ethers.utils.zeroPad(value, 32))
    
        await ethers.provider.send(
            "hardhat_setStorageAt",
            [
                contractAddress,
                balanceSlot,
                storageValue
            ]
        )
        return await erc20.balanceOf(userAddress) == value
    }

    async function findBalanceSlot(erc20) {
        const snapshot = await network.provider.send("evm_snapshot")
        for (let slotNumber = 0; slotNumber < 100; slotNumber++) {
            try {
                if (await checkSlot(erc20, slotNumber)) {
                    await ethers.provider.send("evm_revert", [snapshot])
                    return slotNumber
                }
            } catch { }
            await ethers.provider.send("evm_revert", [snapshot])
        }
    }

    const changeBalance = async (tokenAddress, value) => {
        const token = await ethers.getContractAt("IERC20", tokenAddress)
        const [signer] = await ethers.getSigners()
        const signerAddress = await signer.getAddress()

        // automatically find mapping slot
        const mappingSlot = await findBalanceSlot(token)
        console.log("Found TOKEN.balanceOf slot: ", mappingSlot)

        // calculate balanceOf[signerAddress] slot
        const signerBalanceSlot = getSlot(signerAddress, mappingSlot)

        await ethers.provider.send(
            "hardhat_setStorageAt",
            [
                token.address,
                signerBalanceSlot,
                ethers.utils.hexlify(ethers.utils.zeroPad(value, 32))
            ]
        )

    }

    before('deploy ServicooUniswapLiquidity', async () => {
        // deploy liquidity contract
        const servicooUniswapLiquidityFactory = await ethers.getContractFactory("ServicooUniswapLiquidity");
        servicooUniswapLiquidity = await servicooUniswapLiquidityFactory.deploy("0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
        await servicooUniswapLiquidity.deployed();

    })
    it("Should print 300000 as initial servicoo fee", async function () {
        const fee = await servicooUniswapLiquidity.servicooFee();
        expect(fee).is.equal(300000)
    });
    it("Should print 500000 as initial servicoo fee", async function () {
        await servicooUniswapLiquidity.setServicooFee(500000)
        expect(await servicooUniswapLiquidity.servicooFee()).is.equal(500000)

    });
    it("Mint new position", async function () {
        const token0Amount = BigNumber.from(Number(100 * (10 ** 18)).toString()) // dai
        const token1Amount = BigNumber.from(Number(100 * (10 ** 6)).toString()) // usdc
        await changeBalance(TOKEN0, token0Amount)
        await changeBalance(TOKEN1, token1Amount)
        const token0 = await ethers.getContractAt("IERC20", TOKEN0);
        const token1 = await ethers.getContractAt("IERC20", TOKEN1);
        await token0.approve(servicooUniswapLiquidity.address, token0Amount)
        await token1.approve(servicooUniswapLiquidity.address, token1Amount)

        res = await servicooUniswapLiquidity.mintNewPosition(TOKEN0, TOKEN1
            , token0Amount, token1Amount, 0, {
            gasPrice: 21000000000,
            gasLimit: 30000000
        })

        console.log(res)
        res.then((result) => {
            console.log(result, "ddddd")
        })
    });
});