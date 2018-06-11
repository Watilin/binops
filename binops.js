var BinOps = (function () {
  "use strict";

  // BinOps uses chunks of 31 bits to safely work in the domain of
  // signed 32 bit integers.
  // Since we want to represent numbers on 53 bits, we have to
  // split them into 2 chunks:
  //    bit 0 to 30  -> 31 bits
  //    bit 31 to 52 -> 22 bits
  // We don’t use more than 53 bits because, with larger numbers,
  // JavaScript starts storing them as IEEE-754 floats,
  // and bitwise logic cannot apply anymore.

  const TWO_POWER_22 = 2 ** 22;
  const TWO_POWER_31 = 2 ** 31;
  const TWO_POWER_53 = 2 ** 53;

  const MASK_31 = TWO_POWER_31 - 1;
  const MASK_22 = TWO_POWER_22 - 1;

  const CONDITION_UNSIGNED_53_BITS = Symbol();
  const CONDITION_SHIFT_OPERAND    = Symbol();

  var checkArg = function (arg, condition) {
    switch (condition) {
      case CONDITION_UNSIGNED_53_BITS:
        if (!Number.isInteger(arg) || arg < 0 || !Number.isSafeInteger(arg)) {
          throw new Error("argument must be an unsigned 53 bits integer");
        }
        break;
      case CONDITION_SHIFT_OPERAND:
        if (!Number.isInteger(arg) || arg < 0 || arg >= 53) {
          throw new Error("argument must be an integer >= 0 and < 53");
        }
        break;
      default:
        console.warn("unimplemented condition");
        break;
    }
  };

  return {
    not: function (a) {
      checkArg(a, CONDITION_UNSIGNED_53_BITS);

      var lowerChunk = a % TWO_POWER_31;
      var upperChunk  = Math.floor(a / TWO_POWER_31);
      var maskedLowerChunk = (~lowerChunk) & MASK_31;
      var maskedUpperChunk = (~upperChunk) & MASK_22;

      return maskedLowerChunk + TWO_POWER_31 * maskedUpperChunk;
    },

    and: function (a, b) {
      checkArg(a, CONDITION_UNSIGNED_53_BITS);
      checkArg(b, CONDITION_UNSIGNED_53_BITS);

      var lowerA = a % TWO_POWER_31;
      var upperA = Math.floor(a / TWO_POWER_31);
      var lowerB = b % TWO_POWER_31;
      var upperB = Math.floor(b / TWO_POWER_31);
      var lowerResult = lowerA & lowerB & MASK_31;
      var upperResult = upperA & upperB & MASK_22;

      return lowerResult + TWO_POWER_31 * upperResult;
    },

    or: function (a, b) {
      checkArg(a, CONDITION_UNSIGNED_53_BITS);
      checkArg(b, CONDITION_UNSIGNED_53_BITS);

      var lowerA = a % TWO_POWER_31;
      var upperA = Math.floor(a / TWO_POWER_31);
      var lowerB = b % TWO_POWER_31;
      var upperB = Math.floor(b / TWO_POWER_31);
      var lowerResult = (lowerA | lowerB) & MASK_31;
      var upperResult = (upperA | upperB) & MASK_22;

      return lowerResult + TWO_POWER_31 * upperResult;
    },

    xor: function (a, b) {
      checkArg(a, CONDITION_UNSIGNED_53_BITS);
      checkArg(b, CONDITION_UNSIGNED_53_BITS);

      var lowerA = a % TWO_POWER_31;
      var upperA = Math.floor(a / TWO_POWER_31);
      var lowerB = b % TWO_POWER_31;
      var upperB = Math.floor(b / TWO_POWER_31);
      var lowerResult = (lowerA ^ lowerB) & MASK_31;
      var upperResult = (upperA ^ upperB) & MASK_22;

      return lowerResult + TWO_POWER_31 * upperResult;
    },

    lshift: function (a, n) {
      checkArg(a, CONDITION_UNSIGNED_53_BITS);
      checkArg(n, CONDITION_SHIFT_OPERAND);

      var lower = a % TWO_POWER_31;
      var upper = Math.floor(a / TWO_POWER_31);

      if (n >= 31) {
        upper = (lower & (2 ** (53-n) - 1)) << (n-31);
        lower = 0;
      }
      else if (n >= 22) {
        upper = (lower >> (31-n)) & MASK_22;
        lower = (lower & (2**(31-n) - 1)) << n;
      }
      else {
        upper = ((upper << n) | (lower >> (31-n)) ) & MASK_22;
        lower = (lower << n) & MASK_31;
      }

      return lower + TWO_POWER_31 * upper;
    },

    urshift: function (a, n) {
      checkArg(a, CONDITION_UNSIGNED_53_BITS);
      checkArg(n, CONDITION_SHIFT_OPERAND);

      var lower = a % TWO_POWER_31;
      var upper = Math.floor(a / TWO_POWER_31);

      if (n >= 31) {
        lower = upper >> (n-31);
        upper = 0;
      }
      else if (n >= 22) {
        lower = (lower >> n) | (upper << (31-n));
        upper = 0;
      }
      else {
        lower = (lower >> n) | ((upper & (2**n - 1)) << (31-n));
        upper = upper >> n;
      }

      return lower + TWO_POWER_31 * upper;
    }
  };
}());
