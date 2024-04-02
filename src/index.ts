import * as algokit from '@algorandfoundation/algokit-utils';

async function main() {
    const algorand = algokit.AlgorandClient.defaultLocalNet();

    // ===== Crear dos cuentas =====
    const alice = algorand.account.random()
    const bob = algorand.account.random();

    console.log("Alice's Address:", alice.addr);

    // ===== Mostrar información de la cuenta de Alice =====
    console.log("Alice's Account:", await algorand.account.getInformation(alice.addr));

}

main();