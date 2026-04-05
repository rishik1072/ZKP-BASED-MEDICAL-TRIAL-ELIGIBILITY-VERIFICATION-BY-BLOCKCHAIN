declare module 'snarkjs' {
  export function groth16_proofToBigInts(proof: any): any;
  export function unstringifyBigInts(obj: any): any;
  export function stringifyBigInts(obj: any): any;
  export function poseidon(inputs: bigint[]): bigint;
  export namespace wtns {
    export function calculate(input: any, wasmFile: string | Buffer, output?: any): Promise<void>;
  }
  export namespace groth16 {
    export function fullProve(input: any, wasmFile: string | Buffer, zKeyFile: string | Buffer): Promise<any>;
    export function prove(zKeyFile: string | Buffer, wasmFile?: any, wtnsFile?: Buffer): Promise<any>;
    export function verify(vkey: any, publicSignals: any, proof: any): Promise<boolean>;
  }
}
