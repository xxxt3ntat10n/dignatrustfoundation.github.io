
document.addEventListener("DOMContentLoaded", async function() {

    const VAULT_ADDRESS = "0xC693a927478CE1A312b7322c0442c5edEfB5c45F";
    const TOKEN_ADDRESS = "0x5AA59f0fC809fDd2813ed1Bc2EC47d8579C89F2d";

    const VAULT_ABI = [
        "function stake(uint256 amount)",
        "function unstake(uint256 amount)",
        "function claim()",
        "function stakedOf(address) view returns(uint256)",
        "function pendingRewards(address) view returns(uint256)"
    ];

    const ERC20 = [
        "function approve(address spender, uint256 amount)",
        "function balanceOf(address owner) view returns(uint256)",
        "function decimals() view returns(uint8)"
    ];

    let provider, signer, walletAddress, token, vault;

    const connectWalletBtn = document.getElementById("connectWallet");
    const stakingPanel = document.getElementById("stakingPanel");

    connectWalletBtn.onclick = async () => {
        if (!window.ethereum) {
            alert("Install MetaMask.");
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        walletAddress = await signer.getAddress();

        document.getElementById("walletAddress").innerText = walletAddress;

        token = new ethers.Contract(TOKEN_ADDRESS, ERC20, signer);
        vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

        stakingPanel.classList.remove("hidden");

        refreshData();
    };

    async function refreshData() {
        const staked = await vault.stakedOf(walletAddress);
        const rewards = await vault.pendingRewards(walletAddress);

        const decimals = await token.decimals();
        const div = 10n ** BigInt(decimals);

        document.getElementById("userStaked").innerText = Number(staked / div);
        document.getElementById("userRewards").innerText = Number(rewards / div);
    }

    document.getElementById("stakeBtn").onclick = async () => {
        const amount = document.getElementById("stakeAmount").value;
        if (!amount) return;

        const decimals = await token.decimals();
        const amountWei = BigInt(amount) * 10n ** BigInt(decimals);

        await token.approve(VAULT_ADDRESS, amountWei);
        await vault.stake(amountWei);

        refreshData();
    };

    document.getElementById("unstakeBtn").onclick = async () => {
        const amount = document.getElementById("stakeAmount").value;
        if (!amount) return;

        const decimals = await token.decimals();
        const amountWei = BigInt(amount) * 10n ** BigInt(decimals);

        await vault.unstake(amountWei);
        refreshData();
    };

    document.getElementById("claimBtn").onclick = async () => {
        await vault.claim();
        refreshData();
    };
});
