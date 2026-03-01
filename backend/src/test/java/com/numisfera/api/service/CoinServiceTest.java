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
}
