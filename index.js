(function () {
  var ProductLibrary = {
    template: '<div class="row"><div class="col image">' +
            '<div class="prod-icon" style="background-image:url({0})"></div>' +
            '</div>' +
            '<div class="col name">{1}</div>' +
            '<div class="col price">{2}</div>' +
            '<div class="col edit">' +
            '<div class="edit-btn" data-id="{3}"></div>' +
            '</div></div>',

    init: function () {
      var header = document.querySelector('.header')
      var content = document.querySelector('.content')
      var lightBox = document.querySelector('.light-box')
      var rowTitle = content.querySelector('.row.title')
      var productList = content.querySelector('.list')

            // Save the selector
      this.lightBox = lightBox
      this.form = lightBox.querySelector('.form')
      this.productListEl = productList

            // Event listener binding
      header.querySelector('.create.btn').addEventListener('click', this.createBtnHandler)
      header.querySelector('.search').addEventListener('input', this.searchHandler)

      rowTitle.addEventListener('click', this.titleClickHandler)

      lightBox.addEventListener('click', this.lightBoxClickHandler)
      lightBox.querySelector('.confirm.btn').addEventListener('click', this.confirmButtonClickHandler)
      lightBox.querySelector('.delete.btn').addEventListener('click', this.deleteButtonClickHandler)

      productList.addEventListener('click', this.productListElClickHandler)

      this.draw()
    },
    draw: function (data) {
      data = data || this.getData()
      this.productListEl.innerHTML = this.buildTemplate(data)
      return this
    },
    createBtnHandler: function (e) {
      ProductLibrary.fillForm().lightBoxClickHandler(e)
    },
    searchHandler: function (e) {
      var query = e.target.value.toLowerCase()
      var data
      if (query) {
        data = ProductLibrary.getData().filter(function (d) {
                    // Search by name or price
          return d.name.toLowerCase().indexOf(query) >= 0 ||
                        d.price.toString().toLowerCase().indexOf(query) >= 0
        })
      }
      ProductLibrary.draw(data)
    },
    titleClickHandler: function (e) {
      var sortKey
      var order
      var classList = e.target.classList

      if (classList.contains('name')) {
        sortKey = 'name'
      } else if (classList.contains('price')) {
        sortKey = 'price'
      }

      if (classList.contains('ASC')) {
                // descending
        classList.remove('ASC')
        classList.add('DESC')
        order = 'DESC'
      } else if (classList.contains('DESC')) {
        classList.remove('DESC')
      } else {
                // ascending
        classList.add('ASC')
        order = 'ASC'
      }

      if (sortKey) {
        ProductLibrary.sortDataHandler(sortKey, order)
      }
    },
    lightBoxClickHandler: function (e) {
      var targetList = ['create btn', 'light-box', 'confirm btn', 'delete btn', 'edit-btn']

      if (targetList.indexOf(e.target.className) >= 0) {
        document.body.classList.toggle('show-lightbox')

                // Stop bubling
        e.stopPropagation()
      }
      return this
    },
    productListElClickHandler: function (e) {
      if (e.target.className === 'edit-btn') {
        var id = e.target.getAttribute('data-id')
        var data = ProductLibrary.getData(id)[0]
        ProductLibrary.fillForm(data).lightBoxClickHandler(e)
      }
      return this
    },
    confirmButtonClickHandler: function (e) {
      var helper = function (id) {
        return ProductLibrary.form.querySelector(id).value
      }
      var reg = new RegExp(/^\d+$/)
      var name = helper('input[name="prodName"]')
      var price = helper('input[name="prodPrice"]')

      if (!name) {
        window.alert('Product Name invalid')
        return
      }

      if (!reg.test(price)) {
        window.alert('Price invalid')
        return
      }

      if (parseInt(price, 10) < 0) {
        window.alert('Price must be greater than or equal 0')
        return
      }

      ProductLibrary.updateData({
        _id: ProductLibrary.form.getAttribute('data-id'),
        image: helper('input[name="prodImgUrl"]'),
        name: name,
        price: price
      })

      ProductLibrary.draw().lightBoxClickHandler(e)
    },
    deleteButtonClickHandler: function (e) {
      var id = ProductLibrary.form.getAttribute('data-id')
      ProductLibrary.deleteData(id).draw()
    },
    fillForm: function (data) {
      var timeStamp = (new Date()).getTime().toString()

      data = data || {}

      ProductLibrary.form.querySelector('input[name="prodImgUrl"]').value = data.image || './cupcake.png'
      ProductLibrary.form.querySelector('input[name="prodName"]').value = data.name || ''
      ProductLibrary.form.querySelector('input[name="prodPrice"]').value = data.price || ''

      ProductLibrary.form.setAttribute('data-id', data._id || timeStamp)

      return this
    },
    sortDataHandler: function (key, order) {
            // default order
      if (!order) {
        this.draw()
      } else {
        var productList = this.getData()
        productList.sort(function (a, b) {
          if (key === 'name') {
            return a[key].localeCompare(b[key])
          } else {
            if (order === 'ASC') {
              return a[key] - b[key]
            } else {
              return b[key] - a[key]
            }
          }
        })
        this.draw(productList)
      }
    },
    buildTemplate: function (productList) {
      var html = ''
      var template = this.template

      productList.forEach(function (product) {
        html += template.format(product.image, product.name, product.price, product._id)
      })

      return html
    },
    getData: function (id) {
      var productList = window.localStorage.getItem('productList')

      productList = productList ? JSON.parse(productList) : []

      if (id) {
        return productList.filter(function (product) {
          return product._id === id
        })
      } else {
        return productList
      }
    },
    updateData: function (newData) {
      var productList = this.getData()
      var found

      for (var i = 0; i < productList.length; i++) {
        if (!found && productList[i]._id === newData._id) {
          productList[i] = newData
          found = true
          break
        }
      }

            // If not found, then push it
      if (!found) {
        productList.push(newData)
      }

      window.localStorage.setItem('productList', JSON.stringify(productList))

      return this
    },
    deleteData: function (id) {
      var productList = this.getData()
      productList = productList.filter(function (product) {
        return product._id !== id
      })
      window.localStorage.setItem('productList', JSON.stringify(productList))
      return this
    }
  }

    // String formater
  if (!String.prototype.format) {
    String.prototype.format = function () {
      var args = arguments
      return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match
      })
    }
  }

  ProductLibrary.init()
})()
