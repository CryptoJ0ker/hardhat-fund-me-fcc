const { expect, version } = require("chai")
const { getNamedAccounts, ethers, deployments, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let deployer
          let fundMe
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              console.log(`Deployer: ${deployer}`)
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  expect(response).to.equal(
                      mockV3Aggregator.address,
                      "Error: MockV3Aggregator address isn`t correctly!"
                  )
              })
          })

          describe("fund", () => {
              it("fails if you dont't sent enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("update the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  expect(response.toString()).to.equal(sendValue.toString())
              })
              it("adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  expect(response).to.equal(deployer)
              })
          })
          describe("withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("Withdraw ETH from a single founder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  expect(endingFundMeBalance.toString()).to.equal("0")
                  expect(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  ).to.equal(endingDeployerBalance.add(gasCost).toString())
              })
              it("Allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      await fundMe
                          .connect(accounts[i])
                          .fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  expect(endingFundMeBalance.toString()).to.equal("0")
                  expect(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  ).to.equal(endingDeployerBalance.add(gasCost).toString())

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      expect(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          )
                      ).to.equal("0")
                  }
              })
              it("Cheaper withdraw ETH from a single founder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  expect(endingFundMeBalance.toString()).to.equal("0")
                  expect(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  ).to.equal(endingDeployerBalance.add(gasCost).toString())
              })
              it("Allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      await fundMe
                          .connect(accounts[i])
                          .fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  expect(endingFundMeBalance.toString()).to.equal("0")
                  expect(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  ).to.equal(endingDeployerBalance.add(gasCost).toString())

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      expect(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          )
                      ).to.equal("0")
                  }
              })
              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  await expect(
                      fundMe.connect(accounts[1]).withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
          describe("Check version", () => {
              it("Version must be actual", async () => {
                  const version = await fundMe.getVersion()
                  expect(version.toString()).to.equal("0")
              })
          })
      })
