const { expect } = chai;

describe('The proxy server should correctly serve an index.html file that, in turn, correctly mounts all service components, by', () => {
  describe('loading the Reviews service module such that', () => {
    it('it has an element with the id "reviews-module"', () => {
      const targetDOMelement = iframeDOM.getElementById('reviews-module');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "item-value-reviews" that has inner HTML equal to 19, the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementById('item-value-reviews');
      const { innerHTML } = targetDOMelement;

      expect(innerHTML).to.equal('19');
    });
  });

  describe('loading the ProductRecommendations service module such that', () => {
    it('it has an element with the id "recommendation-submodule-customer"', () => {
      const targetDOMelement = iframeDOM.getElementById('recommendation-submodule-customer');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "recommendation-submodule-treat"', () => {
      const targetDOMelement = iframeDOM.getElementById('recommendation-submodule-treat');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "recommendation-submodule-pet"', () => {
      const targetDOMelement = iframeDOM.getElementById('recommendation-submodule-pet');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "PR-link-101" that is, itself, the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementById('PR-link-101');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "PR-link-120" that is, itself, the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementById('PR-link-120');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "PR-link-199" that is, itself, the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementById('PR-link-199');

      expect(targetDOMelement).to.not.be.null;
    });
  });

  describe('loading the photo-gallery service module such that', () => {
    it('it has an element with the class "galleryMainImageDiv"', () => {
      const targetDOMelement = iframeDOM.getElementsByClassName('galleryMainImageDiv');

      expect(targetDOMelement.length).to.equal(1);
    });

    it('it has an element with the class "galleryMainImage" that has inner HTML equal to the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementsByClassName('galleryMainImage')[0];
      const { src } = targetDOMelement;

      expect(src).to.equal('https://images.unsplash.com/photo-1581467655410-0c2bf55d9d6c?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0MzcyOX0');
    });
  });

  describe('loading the description_directions_attributes service module such that', () => {
    it('it has an element with the id "indexComponent"', () => {
      const targetDOMelement = iframeDOM.getElementById('indexComponent');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "descriptionTab" that has inner HTML equal to "CatToys Spring-Loaded Mouse", the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementById('descriptionTab');
      const { innerHTML } = targetDOMelement;

      expect(innerHTML).to.contain('CatToys Spring-Loaded Mouse');
    });
  });

  describe('loading the mainTitle_price service module such that', () => {
    it('it has an element with the id "priceSpan"', () => {
      const targetDOMelement = iframeDOM.getElementById('priceSpan');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the id "priceSpan" that has inner HTML equal to 12.99, the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementById('priceSpan');
      const { innerHTML } = targetDOMelement;

      expect(innerHTML).to.contain('12.99');
    });
  });

  describe('loading the deliver-pickup service module such that', () => {
    it('it has an element with the id "itemAvailability"', () => {
      const targetDOMelement = iframeDOM.getElementById('itemAvailability');

      expect(targetDOMelement).to.not.be.null;
    });

    it('it has an element with the class "deliverPickupItemPrice" that has inner HTML equal to 19, the hardcoded value for item 100', () => {
      const targetDOMelement = iframeDOM.getElementsByClassName('deliverPickupItemPrice');
      const { innerHTML } = targetDOMelement[0];

      expect(innerHTML).to.contain('$12.99');
    });
  });
});

describe('The proxy server should return 404 when', () => {
  it('receives an item ID that is not between 100 - 199', (done) => {
    axios.get('/product?itemID=99')
      .then(() => {
        //shouldn't reach this code. If it does, then 404 not returned and this should run a test designed to fail
        expect(false).to.equal(true);
      })
      .catch((err) => {
        expect(err.response.status).to.equal(404);
      })
      .then(() => {
        done();
      });
  });
});
