import * as algokit from '@algorandfoundation/algokit-utils';

async function main() {
    const algorand = algokit.AlgorandClient.defaultLocalNet();

    // ===== Crear dos cuentas =====
    const alice = algorand.account.random()
    const bob = algorand.account.random();

    console.log("Alice's Address:", alice.addr);

    // ===== Mostrar información de la cuenta de Alice =====
    console.log("Alice's Account:", await algorand.account.getInformation(alice.addr));

    // ===== Enviar algunos ALGO a Alice =====
    const dispenser = await algorand.account.dispenser();
    await algorand.send.payment({
        sender: dispenser.addr,
        receiver: alice.addr,
        amount: algokit.algos(10),
    });

    // ===== Ver el nuevo balance de Alice =====
    console.log("Alice's Account", await algorand.account.getInformation(alice.addr));

    // ===== Crear el ASA (Algorand Standard Asset) =====
    const createResult = await algorand.send.assetCreate({
        sender: alice.addr,
        total: 100n,
    });

    // ===== Mostrar el AssetIndex del ASA creado =====
    console.log("Create result confirmation",  createResult.confirmation);
    const assetId = BigInt(createResult.confirmation.assetIndex!);

}

main();