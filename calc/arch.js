var calc = function () {
  document.body.appendChild(calc.display)
  document.body.appendChild(calc.keypad)
}

!function () {

var html = {};

['tr', 'td', 'input', 'div', 'table'].forEach(function (a) {
  html[a] = function() { return document.createElement(a) }
})

Arch.precision = 6

var
c = new Arch(Math.log(299792458)),      //         m   s^{-1}
G = new Arch(Math.log(4 * Math.PI * 6.67408e-11)),    // kg^{-1} m^3 s^{-2}
h = new Arch(Math.log(6.626070040e-34)), // kg      m^2 s^{-1}
Boltzmann = new Arch(Math.log(1.38064852e-23)), // J K^{-1}
/*
   2014 CODATA recommended values
   http://physics.nist.gov/constants
 */
tau = new Arch(Math.log(2 * Math.PI), 0.25),
two = new Arch(Math.log(2)),

kg = c.inv          .mul(G)    .mul(h.inv).mul(tau).log.mul(two.inv).exp,
m  = c.mul(c).mul(c).mul(G.inv).mul(h.inv).mul(tau).log.mul(two.inv).exp,
s  = m.mul(c)

var
e, touch,
isFixed = function() {
  return e.hasOwnProperty('value')
},
fix = function() {
  e.value || set(parseArch(e.data.textContent))
},
fixAsIs = function() {
  set(e.value ? e.value.exp() : parseArch(e.data.textContent + 'X'))
},
moveFocus = function() {
  e.classList.remove('focus')
  e = this.cell
  e.classList.add('focus')
},
makeCell = function() {
  var
  cell  = html.tr(),
  label = html.td(),
  input = html.input(),
  data  = html.td()

  label.appendChild(input)
  cell.appendChild(label)
  cell.appendChild(data)

  cell.label = input
  cell.data = data

  input.cell = cell
  input.onchange = function() {
    if (this.value === '') {
      this.cell.data[touch] = moveFocus
      while (this.cell.previousSibling.label.value !== '') {
        calc.display.insertBefore(this.cell, this.cell.previousSibling)
      }
      this.cell.classList.remove('button')
    } else
    {
      this.cell.data[touch] = function() {
        fix(); e.value && push(); set(this.cell.value)
      }
      if (e === this.cell) {
        fix()
        e.previousSibling ? e.previousSibling.data[touch]() : push()
      }
      this.cell.classList.add('button')
      while (this.cell.nextSibling && this.cell.nextSibling.label.value === '') {
        calc.display.insertBefore(this.cell, this.cell.nextSibling.nextSibling)
      }
      while (this.cell.nextSibling && this.cell.nextSibling.value.ord < this.cell.value.ord) {
        calc.display.insertBefore(this.cell, this.cell.nextSibling.nextSibling)
      }
    }
  }
  data.cell = cell
  data.textContent = '0'
  data[touch] = moveFocus

  return cell
},
push = function() {
  calc.display.insertBefore(makeCell(), e.nextSibling)
  e.nextSibling.data[touch]()
},
pop = function() {
  var _ = e.value

  e.previousSibling &&
  (e.previousSibling.data[touch](), calc.display.removeChild(e.nextSibling))

  return _
},
set = function(a) {
  e.value = a; e.data.textContent = a.toString()
},
numeric = function() {
  var label = this.textContent, _

  e.value && push()
  _ = e.data
  _.textContent = (_.textContent === '0' ? '' : _.textContent) + label
},
keys = {
  '0': numeric,
  '1': numeric,
  '2': numeric, '3': numeric, '4': numeric, '5': numeric,
  '6': numeric, '7': numeric, '8': numeric, '9': numeric,
  '.': function() {
    e.value && push()
    e.data.textContent += '.'
  },
  '↑': function() {
    if (e.value) {
      push(); set(e.previousSibling.value)
    } else
    {
      set(parseArch(e.data.textContent))
    }
  },
  '↓': function() {
    if (e.previousSibling) {
      pop()
    } else
    {
      delete e.value
      e.data.textContent = '0'
    }
  },
  '←': function() {
    var _ = e.data

    if (e.value) {
      delete e.value
      _.textContent = '0'
    } else
    {
      _.textContent = _.textContent.slice(0, -1)
      _.textContent === '' && (_.textContent = '0')
    }
  },
  'kg': function() {
    fix(); e.value && push(); set(kg)
  },
  'm': function() {
    fix(); e.value && push(); set(m)
  },
  's': function() {
    fix(); e.value && push(); set(s)
  },
  'exp': function() {
    fixAsIs()
  },
  'log': function() {
    e.value || set(parseArch(e.data.textContent)); e.value && set(e.value.log)
  },
  '/': function() {
    fix(); e.value && set(e.value.inv)
  },
  '−': function() {
    fix(); e.value && set(e.value.neg)
  },
  '†': function() {
    fix(); e.value && set(e.value.conj)
  },
  ' ': function() {
    var _
    if (e.previousSibling) {
      fix(); _ = pop()
      if (e.value) {
        set(e.value.mul(_))
      } else
      {
        set(0)
      }
    }
  },
  '+': function() {
    var _
    if (e.previousSibling) {
      fix(); _ = pop()
      if (e.value) {
        set(e.value.add(_))
      } else
      {
        set(_)
      }
    }
  }
}

touch = html.div().hasOwnProperty('ontouchend') ? 'ontouchend' : 'onmouseup';

calc.display = html.table()
calc.keypad  = html.table()

e = makeCell()
calc.display.appendChild(e)
calc.display.classList.add('display');

[ ['↑'  , '↓', '←', '7', '8', '9'],
  ['kg' , 'm', 's', '4', '5', '6'],
  ['log', ' ', '/', '1', '2', '3'],
  ['exp', '+', '−', '0', '.', '†'] ].forEach(function (tds) {
  var tr = html.tr()

  tds.forEach(function (td) {
    var _ = html.td()

    _.textContent = td
    _[touch] = keys[td]
    tr.appendChild(_)
  })
  calc.keypad.appendChild(tr)
})
calc.keypad.classList.add('keypad')

}()

onload = calc