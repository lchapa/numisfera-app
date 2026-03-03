package com.numisfera.api.service;

import com.numisfera.api.model.Coin;
import com.numisfera.api.repository.CoinRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class CoinServiceTest {

    @Mock
    private CoinRepository coinRepository;

    @InjectMocks
    private CoinServiceImpl coinService;

    private Coin coin1;
    private Coin coin2;

    @BeforeEach
    public void setup() {
        coin1 = new Coin();
        coin1.setId(1L);
        coin1.setName("Coin 1");
        coin1.setCountry("Mexico");
        coin1.setYear(2000);

        coin2 = new Coin();
        coin2.setId(2L);
        coin2.setName("Coin 2");
        coin2.setCountry("USA");
        coin2.setYear(2010);
    }

    @Test
    public void testGetAllCoins() {
        // given
        given(coinRepository.findAll()).willReturn(Arrays.asList(coin1, coin2));

        // when
        List<Coin> coins = coinService.getAllCoins();

        // then
        assertThat(coins).isNotNull();
        assertThat(coins.size()).isEqualTo(2);
        verify(coinRepository).findAll();
    }

    @Test
    public void testGetCoinById_Found() {
        // given
        given(coinRepository.findById(1L)).willReturn(Optional.of(coin1));

        // when
        Optional<Coin> coin = coinService.getCoinById(1L);

        // then
        assertThat(coin).isPresent();
        assertThat(coin.get().getName()).isEqualTo("Coin 1");
    }

    @Test
    public void testGetCoinById_NotFound() {
        // given
        given(coinRepository.findById(anyLong())).willReturn(Optional.empty());

        // when
        Optional<Coin> coin = coinService.getCoinById(99L);

        // then
        assertThat(coin).isNotPresent();
    }

    @Test
    public void testCreateCoin() {
        given(coinRepository.save(any(Coin.class))).willReturn(coin1);

        Coin savedCoin = coinService.createCoin(coin1);

        assertThat(savedCoin).isNotNull();
        assertThat(savedCoin.getId()).isEqualTo(1L);
    }

    @Test
    public void testUpdateCoin() {
        Coin updateDetails = new Coin();
        updateDetails.setName("Updated Coin");
        updateDetails.setCountry("Updated Country");

        given(coinRepository.findById(1L)).willReturn(Optional.of(coin1));
        given(coinRepository.save(any(Coin.class))).willReturn(coin1);

        Optional<Coin> updatedCoin = coinService.updateCoin(1L, updateDetails);

        assertThat(updatedCoin).isPresent();
        assertThat(updatedCoin.get().getName()).isEqualTo("Updated Coin");
        assertThat(updatedCoin.get().getCountry()).isEqualTo("Updated Country");
    }

    @Test
    public void testDeleteCoin() {
        given(coinRepository.findById(1L)).willReturn(Optional.of(coin1));

        boolean isDeleted = coinService.deleteCoin(1L);

        assertThat(isDeleted).isTrue();
        verify(coinRepository).delete(coin1);
    }

    @Test
    public void testDeleteCoin_NotFound() {
        given(coinRepository.findById(99L)).willReturn(Optional.empty());

        boolean isDeleted = coinService.deleteCoin(99L);

        assertThat(isDeleted).isFalse();
    }
}
