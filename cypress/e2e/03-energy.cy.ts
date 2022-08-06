import {
  AURA_ENERGIES,
  AURA_INBOUND_ENERGIES,
  connectionsInEnergyFilterAll,
  connectionsInEnergyFilterAllSortedByRateAscending,
  connectionsInEnergyFilterAllSortedByRateDescending,
  connectionsInEnergyFilterExcludeZero,
  connectionsInEnergyFilterExcludeZeroSortedByRateAscending,
  connectionsInEnergyFilterExcludeZeroSortedByRateDescending,
  FAKE_BRIGHT_ID,
  getEnergyAllocationAmount,
  getEnergyAllocationPercentageString,
  getInboundEnergy,
  getRating,
  newEnergyAllocation,
  oldEnergyAllocation,
  oldRatings,
  ratedConnection,
  ratedConnectionNegative,
  ratedConnectionWithoutEnergy,
  ratedMoreThanOrEqualToOneConnections,
  unratedConnection,
} from '../utils/data'
import { ENERGY_TABS, TOAST_ERROR, TOAST_SUCCESS } from '../../utils/constants'
import { Connection, EnergyAllocation } from '../../types'

describe('Energy', () => {
  beforeEach(() => {
    cy.on('window:before:load', win => {
      cy.spy(win.console, 'error').as('spyWinConsoleError')
      cy.spy(win.console, 'warn').as('spyWinConsoleWarn')
    })
    // @ts-ignore
    cy.blockApiRequests()
    // @ts-ignore
    cy.setupProfile()
    cy.intercept(
      {
        url: `/v1/energy/${FAKE_BRIGHT_ID}`,
        method: 'GET',
      },
      {
        body: AURA_ENERGIES,
      }
    )
    cy.intercept(
      {
        url: `/v1/energy/inbound/${FAKE_BRIGHT_ID}`,
        method: 'GET',
      },
      {
        body: AURA_INBOUND_ENERGIES,
      }
    )
  })

  afterEach(() => {
    cy.get('@spyWinConsoleError').should('have.callCount', 0)
    cy.get('@spyWinConsoleWarn').should('have.callCount', 0)
  })

  function submitEnergyFailure() {
    cy.intercept(
      {
        url: `/v1/energy/${FAKE_BRIGHT_ID}`,
        method: 'POST',
      },
      {
        statusCode: 500,
      }
    ).as('submitEnergyError')
    cy.get('[data-testid=update-energy]').click()
    cy.wait('@submitEnergyError')
    cy.get(`.toast--${TOAST_ERROR}`)
  }

  function submitEnergySuccess() {
    cy.intercept(
      {
        url: `/v1/energy/${FAKE_BRIGHT_ID}`,
        method: 'POST',
      },
      {
        body: { energyAllocation: newEnergyAllocation },
        statusCode: 200,
      }
    ).as('submitEnergy')
    cy.intercept(
      {
        url: `/v1/energy/${FAKE_BRIGHT_ID}`,
        method: 'GET',
      },
      {
        body: { energy: newEnergyAllocation },
      }
    )

    cy.get('[data-testid=update-energy]').click()
    cy.wait('@submitEnergy')
      .its('request.body')
      .should(body => {
        expect(body).to.have.key('encryptedTransfers')
      })
    cy.get(`.toast--${TOAST_SUCCESS}`)
  }

  function showsConnectionInViewTab(
    connection: Connection,
    allocation: EnergyAllocation
  ) {
    cy.get(`[data-testid^=user-v2-${connection.id}-name]`).contains(
      connection.name
    )
    const rating = getRating(connection.id, oldRatings)
    if (rating) {
      cy.get(`[data-testid^=user-v2-${connection.id}-rating]`).contains(rating)
      cy.get(`[data-testid^=user-v2-${connection.id}-inbound]`).contains(
        getInboundEnergy(connection.id)
      )
      cy.get(`[data-testid^=user-v2-${connection.id}-outbound]`).contains(
        getEnergyAllocationPercentageString(allocation, connection.id)
      )
    } else {
      cy.get(`[data-testid^=user-v2-${connection.id}-rating]`).should(
        'not.exist'
      )
    }
  }

  function showsConnectionInSetTab(
    connection: Connection,
    allocation: EnergyAllocation
  ) {
    cy.get(`[data-testid=user-v3-${connection.id}-name]`).contains(
      connection.name
    )
    cy.get(`[data-testid=user-v3-${connection.id}-rating]`).contains(
      getRating(connection.id, oldRatings)!
    )
    cy.get(`[data-testid=user-slider-${connection.id}-percentage]`).contains(
      getEnergyAllocationPercentageString(allocation, connection.id)
    )
  }

  it('shows energies in the view tab', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.VIEW}`)

    // shows rated connections
    ratedMoreThanOrEqualToOneConnections.forEach(c => {
      showsConnectionInViewTab(c, oldEnergyAllocation)
    })

    // does not show unrated or negative rated connections
    cy.get(`[data-testid=user-v2-${unratedConnection.id}-name]`).should(
      'not.exist'
    )
    cy.get(`[data-testid=user-v2-${ratedConnectionNegative.id}-name]`).should(
      'not.exist'
    )
  })

  it('can search connections', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.VIEW}`)

    /* TODO: fix the issue that causes this test to fail when removing the following line.
            currently the user should wait for page load and then type in search
     */
    cy.get(`[data-testid^=user-v2-${ratedConnection.id}-name]`)

    // shows unrated connections when searching, but not negative rated ones
    cy.get('[data-testid=top-search]').type('ra')
    showsConnectionInViewTab(unratedConnection, oldEnergyAllocation)
    cy.get(`[data-testid=user-v2-${ratedConnectionNegative.id}-name]`).should(
      'not.exist'
    )
    cy.get('[data-testid=top-search]').clear()

    // filters based on search value
    cy.get('[data-testid=top-search]').type(unratedConnection.name)
    cy.get(
      `[data-testid=user-v2-${ratedConnectionWithoutEnergy.id}-name]`
    ).should('not.exist')
    cy.get('[data-testid=top-search]').clear()
  })

  function checkConnectionOrderInViewTab(brightId: string, index: number) {
    cy.get(`[data-testid=user-v2-${brightId}-name-${index}]`).should('exist')
  }

  function assertOrder(orderedConnections: Connection[]) {
    orderedConnections.forEach((r, i) => {
      checkConnectionOrderInViewTab(r.id, i)
    })
  }

  it('orders connections by rating', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.VIEW}`)

    // sorting by rate should change the order for the test to be valid
    expect(connectionsInEnergyFilterAllSortedByRateAscending).to.not.deep.equal(
      connectionsInEnergyFilterAll
    )
    expect(
      connectionsInEnergyFilterAllSortedByRateDescending
    ).to.not.deep.equal(connectionsInEnergyFilterAll)

    connectionsInEnergyFilterAll.forEach((c, i) => {
      checkConnectionOrderInViewTab(c.id, i)
    })

    cy.get('[data-testid=filter-Rated-inactive]').click()
    assertOrder(connectionsInEnergyFilterAllSortedByRateDescending)

    cy.get('[data-testid=filter-Rated-descending]').click()
    assertOrder(connectionsInEnergyFilterAllSortedByRateAscending)

    cy.get('[data-testid=filter-Rated-ascending]').should('exist')
  })

  function assertExcludeZerosFilter(isApplied: boolean) {
    cy.get(
      `[data-testid^=user-v2-${ratedConnectionWithoutEnergy.id}-name]`
    ).should(isApplied ? 'not.exist' : 'exist')
  }

  it('exclude zeros filter', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.VIEW}`)
    assertExcludeZerosFilter(false)
    cy.get(`[data-testid=filter-ExcludeZeros-inactive]`).click()
    assertExcludeZerosFilter(true)
    cy.get(`[data-testid=filter-ExcludeZeros-active]`).click()
    assertExcludeZerosFilter(false)
    cy.get(`[data-testid=filter-ExcludeZeros-inactive]`).should('exist')
  })

  it('can order filtered list', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.VIEW}`)

    expect(connectionsInEnergyFilterAll).to.not.deep.equal(
      connectionsInEnergyFilterExcludeZero
    )
    // sorting by rate should change the order for the test to be valid
    expect(
      connectionsInEnergyFilterExcludeZeroSortedByRateAscending
    ).to.not.deep.equal(connectionsInEnergyFilterExcludeZero)
    expect(
      connectionsInEnergyFilterExcludeZeroSortedByRateDescending
    ).to.not.deep.equal(connectionsInEnergyFilterExcludeZero)

    // filter
    assertExcludeZerosFilter(false)
    cy.get(`[data-testid=filter-ExcludeZeros-inactive]`).click()
    assertExcludeZerosFilter(true)
    cy.get(`[data-testid=filter-ExcludeZeros-active]`).should('exist')

    // order
    connectionsInEnergyFilterExcludeZero.forEach((c, i) => {
      checkConnectionOrderInViewTab(c.id, i)
    })

    cy.get('[data-testid=filter-Rated-inactive]').click()
    assertOrder(connectionsInEnergyFilterExcludeZeroSortedByRateDescending)

    cy.get('[data-testid=filter-Rated-descending]').click()
    assertOrder(connectionsInEnergyFilterExcludeZeroSortedByRateAscending)

    cy.get('[data-testid=filter-Rated-ascending]').should('exist')
  })

  it('can filter ordered list', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.VIEW}`)

    expect(connectionsInEnergyFilterAll).to.not.deep.equal(
      connectionsInEnergyFilterAllSortedByRateAscending
    )
    expect(connectionsInEnergyFilterAllSortedByRateAscending).to.not.deep.equal(
      connectionsInEnergyFilterExcludeZeroSortedByRateAscending
    )

    // order
    cy.get('[data-testid=filter-Rated-inactive]').click()
    assertOrder(connectionsInEnergyFilterAllSortedByRateDescending)

    // filter
    cy.get(`[data-testid=filter-ExcludeZeros-inactive]`).click()
    assertOrder(connectionsInEnergyFilterExcludeZeroSortedByRateDescending)
    cy.get('[data-testid=filter-Rated-descending]').should('exist')
    cy.get('[data-testid=filter-ExcludeZeros-active]').should('exist')
  })

  it('shows energies in set tab', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.SET}`)
    cy.get(`[data-testid=user-v3-${unratedConnection.id}-name]`).should(
      'not.exist'
    )
    showsConnectionInSetTab(ratedConnection, oldEnergyAllocation)
    showsConnectionInSetTab(ratedConnectionWithoutEnergy, oldEnergyAllocation)
    cy.get(
      `[data-testid=user-slider-${ratedConnectionWithoutEnergy.id}-input]`
    ).should('have.value', 0)
    cy.get(`[data-testid=user-slider-${ratedConnection.id}-input]`).should(
      'have.value',
      getEnergyAllocationAmount(oldEnergyAllocation, ratedConnection.id)
    )
  })

  it('can update energies', () => {
    cy.visit(`/energy/?tab=${ENERGY_TABS.SET}`)
    cy.get(`[data-testid=user-slider-${ratedConnectionWithoutEnergy.id}-input]`)
      .type('{selectAll}')
      .type(
        getEnergyAllocationAmount(
          newEnergyAllocation,
          ratedConnectionWithoutEnergy.id
        )
      )

    cy.get(`[data-testid=user-slider-${ratedConnection.id}-input]`)
      .type('{selectAll}')
      .type(getEnergyAllocationAmount(newEnergyAllocation, ratedConnection.id))

    showsConnectionInSetTab(ratedConnection, newEnergyAllocation)
    showsConnectionInSetTab(ratedConnectionWithoutEnergy, newEnergyAllocation)
    submitEnergyFailure()
    submitEnergySuccess()
    cy.get('[data-testid=energy-tab-switch-view]').click()
    showsConnectionInViewTab(ratedConnection, newEnergyAllocation)
    showsConnectionInViewTab(ratedConnectionWithoutEnergy, newEnergyAllocation)
  })
})
