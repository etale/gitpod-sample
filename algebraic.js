class Algebraic {
  eql(a) { return this.valueOf() === a }
  get zero() { return 0 }
  get unity() { return 1 }
  get unit() { return this < 0 ? -this.unity : this.unity }
  get body() { return this < 0 ? -this : this.valueOf() }
  get isZero() { return this.eql(this.zero) }
  get isUnity() { return this.eql(this.unity) }
  get isUnit() { return this.eql(this.unit) }
  get isBody() { return this.eql(this.body) }
  divmod(a) {
    return (
      ((_) => (
        a.isZero ? [a, _] : (
          ((r) => (
            r < 0 && (r += a),
            ((q) => (
              [q, r]
            ))((_ - r)/a)
          ))(_ % a)
        )
      ))(this.valueOf())
    )
  }
  div(a) { return this.divmod(a)[0] }
  mod(a) { return this.divmod(a)[1] }
  gcd(a) {
    return (
      ((_) => {
        while (!a.isZero) {
          [_, a] = [a, _.mod(a)]
        }
        return _
      })(this.valueOf())
    )
  }
  ub(a) {
    return (
      this.isZero || a.isZero ? [this.unit, this.body] : (
        ((_, b) => {
          let d
          while (true) {
            d = _.gcd(a)
            if (d.isUnity) {
              break
            }
            _ /= d; b *= d
          }
          return [_, b]
        })(this.valueOf(), this.unity)
      )
    )
  }
  lcm(a) {
    return this * a / this.gcd(a)
  }
  _inv(a) {
    return (
      ((_, x, z, n) => {
        if (a.isZero && (-_).isUnity)
          return _
        while (!a.isZero) {
          (([q, r]) => {
            [_, a, x, z] = [a, r, z, x - q * z]
            console.log({_, a, x, z })
          })(_.divmod(a))
        }
        return x.mod(n)
      })(this.valueOf(), this.unity, this.zero, a)
    )
  }
  get factorize() {
    return (
      (({ body, zero, unity }, fs) => {
        while (!body.isUnity) {
          ((p) => {
            fs.has(p) || fs.set(p, zero)
            fs.set(p, fs.get(p) + unity)
            body /= p
          })(body.factor)
        }
        return fs
      })(this, new Map)
    )
  }
}

(({ ownKeys, defineProperty }) => (
  (({ prototype }) => (
    ownKeys(Math).forEach((p) => (
      ((f) => (
        typeof f === 'function' &&
        defineProperty(prototype, p, f.length < 2 ? {
          get() {
            return f(this)
          }
        } : {
          value(a) {
            return f(this, a)
          }
        })
      ))(Math[p])
    )),
    defineProperty(prototype, 'factor', {
      get() {
        return (
          !(this % 2) ? 2 :
          !(this % 3) ? 3 :
          !(this % 5) ? 5 :
          ((_, p) => {
            while (p * p < _) {
              if (!(_ % p)) return p // 7
              p += 4
              if (!(_ % p)) return p // 11
              p += 2
              if (!(_ % p)) return p // 13
              p += 4
              if (!(_ % p)) return p // 17
              p += 2
              if (!(_ % p)) return p // 19
              p += 4
              if (!(_ % p)) return p // 23
              p += 6
              if (!(_ % p)) return p // 29
              p += 2
              if (!(_ % p)) return p // 1
              p += 6
            }
            return _
          })(this.valueOf(), 7)
        )
      }
    })
  ))(Number),
  (({ prototype }) => (
    defineProperty(prototype, 'zero', { value: 0n }),
    defineProperty(prototype, 'unity', { value: 1n }),
    defineProperty(prototype, 'factor', {
      get() {
        return (
          !(this % 2n) ? 2n :
          !(this % 3n) ? 3n :
          !(this % 5n) ? 5n :
          ((_, p) => {
            while (p * p < _) {
              if (!(_ % p)) return p // 7
              p += 4n
              if (!(_ % p)) return p // 11
              p += 2n
              if (!(_ % p)) return p // 13
              p += 4n
              if (!(_ % p)) return p // 17
              p += 2n
              if (!(_ % p)) return p // 19
              p += 4n
              if (!(_ % p)) return p // 23
              p += 6n
              if (!(_ % p)) return p // 29
              p += 2n
              if (!(_ % p)) return p // 1
              p += 6n
            }
            return _
          })(this.valueOf(), 7n)
        )
      }
    })
  ))(BigInt)
))(Reflect)

Reflect.setPrototypeOf(Number.prototype, Algebraic.prototype)
Reflect.setPrototypeOf(BigInt.prototype, Algebraic.prototype)

const PI2 = Math.PI * 2

class Arch extends Algebraic {
  constructor(ord = 0, arg = 0) {
    super()
    arg %= 1; arg < 0 && (arg += 1)
    this.ord = ord; this.arg = arg
  }
  get amp() { return (
    (({ arg }) => {
      arg < 0.5 || (arg -= 1)
      return arg * PI2
    })(this)
  ) }
  eql(a) { return a !== 0 && this.ord === a.ord && this.arg === a.arg }
  get unit() { return new Arch(0, this.arg) }
  get body() { return new Arch(this.ord, 0) }
  get shift() { return new Arch(this.ord + 1, this.arg) }
  get succ() { return this.exp.shift.log }
  get conj() { return new Arch(this.ord, -this.arg) }
  get inv() { return new Arch(-this.ord, -this.arg) }
  mul(a) { return a === 0 ? 0 : new Arch(this.ord + a.ord, this.arg + a.arg) }
  get neg() { return new Arch(this.ord, this.arg + 0.5) }
  add(a) { return a === 0 ? this : this.neg.eql(a) ? 0 : this.ord < a.ord ? a.add(this) : this.mul(this.inv.mul(a).succ) }
  get log() { return (({ isUnity, ord, amp }) => (
    isUnity ? 0 :
    new Arch((ord ** 2 + amp ** 2).log * 0.5, amp.atan2(ord) / PI2)
  ))(this)}
  get exp() { return (({ ord, amp }) => (
    (({ exp }, { cos, sin }) => (
      new Arch(exp * cos, exp * sin / PI2)
    ))(ord, amp)
  ))(this)}
  toString() { return (({ ord, arg }) => {
    ord = ord.toFixed(Arch.precision).split('.')
    arg = arg.toFixed(Arch.precision).split('.')
    ord[1] || (ord[1] = '0')
    arg[1] || (arg[1] = '0')
    return ord[0] + '.' + ord[1] + '.' + arg[1] + 'X'
  })(this) }
}
Reflect.defineProperty(Arch.prototype, 'unity', { value: new Arch })

function parseArch(a) {
  var _ = a.split('.'), ord, arg

  _ = [0, 1, 2].map(function (i) {
    return _[i] || '0'
  })
  ord = parseFloat(_[0] + '.' + _[1])
  arg = parseFloat(      '0.' + _[2])
  _ = new Arch(ord, arg)
  return a.indexOf('X') === -1 ? _.log : _
}
Arch.precision = 8

class Adele extends Algebraic {
  constructor(r = 0n, s = 1n, n = 0n) {
    (([u, s]) => {
      super()
      this.r = (r * u._inv(n)).mod(n * s)
      this.s = s
      this.n = n
    })(s.ub(n))
  }
  get finalize() {
    return (
      (({ n, r, s }) => (
        n.isUnity || s.isZero ? nil :
        ((d) => (
          new Adele(r.div(d), s.div(d), n)
        ))(r.gcd(s))
      ))(this)
    )
  }
  coerce(a) {
    return (
      (({ n: _n, r: _r, s: _s }, { n: an, r: ar, s: as }) => (
        ((n) => (
          n.isUnity ? [nil, nil] :
          (([_u, _s], [au, as]) => (
            ((s) => (
              ((_r, ar) => (
                [new Adele(ar, s, n), new Adele(_r, s, n)]
              ))(_r * _u._inv(n) * s.div(_s), ar * au._inv(n) * s.div(as))
            ))(_s.lcm(as))
          ))(_s.ub(n), as.ub(n))
        ))(_n.gcd(an))
      ))(this, a)
    )
  }
  eql(a) { return this.n === a.n && this.r === a.r && this.s === a.s }
  get zero() { return new Adele(0n, this.s, this.n) }
  get neg() { return this.eql(nil) ? nil : new Adele(-this.r, this.s, this.n) }
  get res() { return (({ n, r, s }) => (
    (([u, n]) => (
      new Adele(0n, 1n, n)
    ))(r.ub(n))
  ))(this)}
  add(a) { return this._add(a).finalize }
  _add(a) { return (([_, a]) => _.__add(a))(this.coerce(a)) }
  __add(a) { return this.eql(nil) ? nil : new Adele(this.r + a.r, this.s, this.n) }
  get unity() { return (({ s, n }) => (
    new Adele(s, s, n)
  ))(this)}
  get inv() { return (({ r, s, n }) => (
    r.isZero ? nil :
    (([u, b]) => (
      new Adele(s * u._inv(n), b, n)
    ))(r.ub(n))
  ))(this) }
  mul(a) { return this._mul(a).finalize }
  _mul(a) { return (([_, a]) => (
    _.__mul(a)
  ))(this.coerce(a)) }
  __mul(a) { return this.eql(nil) ? nil : new Adele(
    this.r * a.r, this.s * a.s, this.n
  ) }
  pow(a) {
    let _ = this, __ = _.unity
    while (a) {
      a.mod(2n).isUnity && (__ = __.mul(_))
      _ = _.mul(_); a = a.div(2n)
    }
    return __
  }
  get unit() {
    return (
      (({ n, r, s }) => (
        (([u, b]) => (
          new Adele(u, 1n, n)
        ))(r.ub(n))
      ))(this)
    )
  }
  get body() {
    return (
      (({ n, r, s }) => (
        (([u, b]) => (
          new Adele(b, s, 0n)
        ))(r.ub(n))
      ))(this)
    )
  }
  get factor() {
    return (
      (({ n, r, s }) => (
        ((p) => (
          r % p
          ? [new Adele(1n, p), new Adele(r, s/p)]
          : [new Adele(p, 1n), new Adele(r/p, s)]
        ))((r * s).factor)
      ))(this)
    )
  }
  toString(a = 10) {
    return (
      this.eql(nil) ? 'nil' :
      (({ n, r, s }, _) => {
        n.isZero  || (_ += n.toString(a) + '\\')
                      _ += r.toString(a)
        s.isUnity || (_ += '/' + s.toString(a))
        return _
      })(this, '')
    )
  }
}
const nil = new Adele(0n, 0n, 1n)
