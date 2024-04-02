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

    // ===== Enviar el ASA a Bob =====
    try {
        await algorand.send.assetTransfer({
            sender: alice.addr,
            receiver: bob.addr,
            assetId,
            amount: 1n,
        })
    } catch (error: any) {
        console.warn("Transfer error", error.response.body.message);
    }

    // ===== Fondear a Bob =====
    await algorand.send.payment({
        sender: dispenser.addr,
        receiver: bob.addr,
        amount: algokit.algos(10),
    });

    // ===== Hacer Opt-in de Bob e intentar de nuevo =====
    await algorand.send.assetOptIn({
        sender: bob.addr,
        assetId,
    })

    await algorand.send.assetTransfer({
        sender: alice.addr,
        receiver: bob.addr,
        assetId,
        amount: 1n,
    })

    console.log("Alice's Assets", await algorand.account.getAssetInformation(alice.addr, assetId));
    console.log("Bob's Assets", await algorand.account.getAssetInformation(bob.addr, assetId));

    // ==== Alice compra de regreso el ASA de Bob ====
    await algorand.newGroup().addPayment({
        sender: alice.addr,
        receiver: bob.addr,
        amount: algokit.algos(1),
    }).addAssetTransfer({
        sender: bob.addr,
        receiver: alice.addr,
        assetId,
        amount: 1n,
    }).execute()

    console.log("Alice's Assets", await algorand.account.getAssetInformation(alice.addr, assetId));
    console.log("Bob's Assets", await algorand.account.getAssetInformation(bob.addr, assetId));
    console.log("Bob's Min Balance", (await algorand.account.getInformation(bob.addr)).minBalance);

    // ==== Bob hace Close out al ASA ====
    await algorand.send.assetTransfer({
        sender: bob.addr,
        receiver: alice.addr,
        assetId,
        amount: 0n,
        closeAssetTo: alice.addr,
    });

    console.log("Bob's Min Balance", (await algorand.account.getInformation(bob.addr)).minBalance);
}

main();