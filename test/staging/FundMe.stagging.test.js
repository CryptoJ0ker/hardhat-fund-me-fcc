const { developmentChains } = require("../../helper-hardhat-config")
const { ethers, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe
          let deployer
          const sendValue = 100000000000000000n
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              expect(endingBalance.toString()).to.equal("0")
          })
      })
