declare module R {
  function __(): void;
  
  function add(first: number, second?: number): any;
  function compose(...f: Function[]) :Function;
  function curry(f: Function) :Function;
  function multiply(a: number, b?: number): any;
  /** 
   * Returns a list of numbers from from (inclusive) to to (exclusive).
   */
  function range(from: number, to: number) :number[];
}
