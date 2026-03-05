package com.numisfera.api.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CoinTest {

    @Test
    public void testCoinSettersAndGetters() {
        Coin coin = new Coin();

        coin.setId(1L);
        coin.setName("Centenario");
        coin.setCountry("Mexico");
        coin.setYear(1921);
        coin.setMaterial("Gold");
        coin.setDescription("A beautiful Mexican gold coin.");
        coin.setGrade("MS-62");
        coin.setImageUrls(java.util.List.of("http://example.com/centenario.jpg"));

        assertEquals(1L, coin.getId());
        assertEquals("Centenario", coin.getName());
        assertEquals("Mexico", coin.getCountry());
        assertEquals(1921, coin.getYear());
        assertEquals("Gold", coin.getMaterial());
        assertEquals("A beautiful Mexican gold coin.", coin.getDescription());
        assertEquals("MS-62", coin.getGrade());
        assertEquals(java.util.List.of("http://example.com/centenario.jpg"), coin.getImageUrls());
    }
}
